import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { discoverApps, type DiscoveredApp } from "./discover";
import { listEnvNames, loadEnvConfig, readCurrentEnv, switchEnv } from "./core";

/**
 * CLI 主入口
 *
 * @param argv 命令行参数（不含 node 与脚本路径）
 * @param repoRoot 仓库根目录，缺省时从当前文件位置向上查找 pnpm-workspace.yaml
 * @returns 进程退出码
 */
export async function main(argv: string[], repoRoot?: string): Promise<number> {
  try {
    const root =
      repoRoot ?? findRepoRoot(path.dirname(fileURLToPath(import.meta.url)));
    const apps = discoverApps(path.join(root, "apps"));
    const [target, env] = argv;

    if (target === undefined) return await printOverview(apps);
    if (env === undefined) return await printAppStatus(apps, target);
    if (target === "all") return await switchAll(apps, env);
    return await switchOne(apps, target, env);
  } catch (err) {
    console.error(`错误: ${(err as Error).message}`);
    return 1;
  }
}

/** 从起始目录向上查找 pnpm-workspace.yaml，定位仓库根目录 */
export function findRepoRoot(startDir: string): string {
  let dir = path.resolve(startDir);
  for (;;) {
    if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("未找到 pnpm-workspace.yaml，无法定位仓库根目录");
    }
    dir = parent;
  }
}

/** 打印所有已接入小程序的总览 */
async function printOverview(apps: DiscoveredApp[]): Promise<number> {
  if (apps.length === 0) {
    console.log(
      "未发现已接入的小程序。接入方式：在 apps/<name>/ 下创建 env.config.ts",
    );
    return 0;
  }
  console.log(`已接入的小程序 (${apps.length}):`);
  for (const app of apps) {
    console.log(`  ${app.name}  ${await describeApp(app)}`);
  }
  return 0;
}

/** 打印单个小程序的当前环境与可用环境 */
async function printAppStatus(
  apps: DiscoveredApp[],
  name: string,
): Promise<number> {
  if (name === "all") {
    console.error('错误: "all" 需要环境参数，用法: pnpm env:switch all <env>');
    return 1;
  }
  const app = findApp(apps, name);
  console.log(`${app.name}  ${await describeApp(app)}`);
  return 0;
}

/** 按名称查找已接入的小程序，未命中时抛出带候选提示的错误 */
function findApp(apps: DiscoveredApp[], name: string): DiscoveredApp {
  const app = apps.find((item) => item.name === name);
  if (app) return app;

  const suggestions = apps
    .filter((item) => item.name.includes(name) || name.includes(item.name))
    .map((item) => item.name);
  const hint =
    suggestions.length > 0 ? `，你是否想找: ${suggestions.join(", ")}` : "";
  throw new Error(
    `未找到小程序 "${name}"${hint}。已接入: ${
      apps.map((item) => item.name).join(", ") || "（无）"
    }`,
  );
}

/** 生成小程序的状态描述（当前环境 + 可用环境） */
async function describeApp(app: DiscoveredApp): Promise<string> {
  const current = readCurrentEnv(app.dir) ?? "未初始化";
  try {
    const config = await loadEnvConfig(app.configFile);
    return `当前: ${current}  可用: ${listEnvNames(config).join(", ")}`;
  } catch {
    return `当前: ${current}  可用: （配置加载失败）`;
  }
}

/** 切换单个小程序到目标环境 */
async function switchOne(
  apps: DiscoveredApp[],
  name: string,
  env: string,
): Promise<number> {
  const app = findApp(apps, name);
  await performSwitch(app, env);
  return 0;
}

/** 批量切换所有已接入且定义了目标环境的小程序 */
async function switchAll(apps: DiscoveredApp[], env: string): Promise<number> {
  if (apps.length === 0) {
    console.error("未发现已接入的小程序，无环境可切换");
    return 1;
  }

  let switched = 0;
  let failed = false;
  for (const app of apps) {
    try {
      const config = await loadEnvConfig(app.configFile);
      if (!listEnvNames(config).includes(env)) {
        console.warn(`警告: [${app.name}] 未定义 "${env}" 环境，已跳过`);
        continue;
      }
      await performSwitch(app, env);
      switched++;
    } catch (err) {
      failed = true;
      console.error(`错误: 切换 [${app.name}] 失败: ${(err as Error).message}`);
    }
  }

  if (switched === 0) {
    console.error(`没有小程序被切换到 "${env}" 环境`);
    return 1;
  }
  return failed ? 1 : 0;
}

/** 执行单个小程序的环境切换并打印结果 */
async function performSwitch(app: DiscoveredApp, env: string): Promise<void> {
  console.log(`正在切换 [${app.name}] 到 [${env}] 环境...`);
  const result = await switchEnv(app, env);
  console.log(`已生成配置文件: ${result.configFile}`);
  if (result.removedLegacyJs) console.log("已清理旧的 config.js");
  if (result.appidSync) {
    console.log(
      `已同步 project.config.json APPID: ${
        result.appidSync.from || "（空）"
      } -> ${result.appidSync.to}`,
    );
  }
  console.log(`环境切换完成！当前环境为: ${env}`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.exit(await main(process.argv.slice(2)));
}
