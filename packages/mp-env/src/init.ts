import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { findRepoRoot } from "./cli";
import { applyPreparedEnv, loadEnvConfig, prepareEnv } from "./core";
import type { PreparedEnv } from "./core";
import { discoverApps, type DiscoveredApp } from "./discover";

const describeFailure = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/** 为尚无 config.ts 的应用生成其默认环境配置 */
export async function main(repoRoot?: string): Promise<number> {
  const counts = { generated: 0, skipped: 0, failed: 0 };
  const pending: { app: DiscoveredApp; prepared: PreparedEnv }[] = [];
  const skip = (app: DiscoveredApp) => {
    counts.skipped++;
    console.log(`skipped [${app.name}]: 已有 config.ts`);
  };
  const fail = (name: string, error: unknown) => {
    counts.failed++;
    console.error(`failed [${name}]: ${describeFailure(error)}`);
  };

  try {
    const root =
      repoRoot ?? findRepoRoot(path.dirname(fileURLToPath(import.meta.url)));
    const apps = discoverApps(path.join(root, "apps"), [".ts"]);
    if (apps.length === 0) console.log("无环境初始化任务");
    for (const app of apps) {
      if (hasConfig(app)) {
        skip(app);
        continue;
      }
      try {
        const config = await loadEnvConfig(app.configFile);
        if (!config.defaultEnv) {
          throw new Error(`${app.configFile} 必须声明有效的 defaultEnv`);
        }
        pending.push({ app, prepared: prepareEnv(config, config.defaultEnv) });
      } catch (error) {
        fail(app.name, error);
      }
    }

    if (counts.failed === 0) {
      for (const { app, prepared } of pending) {
        if (hasConfig(app)) {
          skip(app);
          continue;
        }
        try {
          const result = applyInitialEnv(app, prepared);
          if (!result) {
            skip(app);
            continue;
          }
          counts.generated++;
          console.log(`generated [${app.name}]: ${result.configFile}`);
        } catch (error) {
          fail(app.name, error);
        }
      }
    }
  } catch (error) {
    fail("初始化", error);
  }

  console.log(
    `初始化结果: generated=${counts.generated} skipped=${counts.skipped} failed=${counts.failed}`,
  );
  return counts.failed > 0 ? 1 : 0;
}

/** 独占创建初始化产物；后续失败时移除本次产物以允许重试 */
function applyInitialEnv(app: DiscoveredApp, prepared: PreparedEnv) {
  const configFile = path.join(app.dir, "config.ts");
  let handle: number;
  try {
    handle = fs.openSync(configFile, "wx");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") return null;
    throw error;
  }

  const isCurrentFile = () => {
    const created = fs.fstatSync(handle);
    const current = fs.lstatSync(configFile, { throwIfNoEntry: false });
    return current?.dev === created.dev && current.ino === created.ino;
  };
  try {
    if (!isCurrentFile()) return null;
    return applyPreparedEnv(app, prepared, handle);
  } catch (error) {
    try {
      if (isCurrentFile()) fs.unlinkSync(configFile);
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        `${describeFailure(error)}；清理本次产物失败：${describeFailure(cleanupError)}`,
      );
    }
    throw error;
  } finally {
    fs.closeSync(handle);
  }
}

/** config.ts 已存在时保留当前环境与 AppID */
function hasConfig(app: DiscoveredApp): boolean {
  return fs.existsSync(path.join(app.dir, "config.ts"));
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.exit(await main());
}
