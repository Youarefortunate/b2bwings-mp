import { constants } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { runCommand } from "./command.mjs";
import { checkInterrupted } from "./interruption.mjs";
import { formatDuration, runStages } from "./runner.mjs";
import { stages } from "./stages.mjs";

const repositoryRoot = fileURLToPath(new URL("../../../../", import.meta.url));

export async function main() {
  const controller = new AbortController();
  const interrupt = (signal) => controller.abort(signal);
  const onSigint = () => interrupt("SIGINT");
  const onSigterm = () => interrupt("SIGTERM");
  process.on("SIGINT", onSigint);
  process.on("SIGTERM", onSigterm);
  try {
    const signal = controller.signal;
    const packageManagerPath = process.env.npm_execpath;
    /** @type {import("./runner.mjs").OnboardContext} */
    const context = {
      root: repositoryRoot,
      signal,
      runCommand: (args) =>
        runCommand(args, { cwd: repositoryRoot, packageManagerPath, signal }),
      checkInterrupted: () => checkInterrupted(signal),
    };
    const startedAt = Date.now();
    await runStages(stages, context);
    // 结束语不套用阶段分隔线，避免被误认为又开始了新阶段
    const total = `${stages.length}/${stages.length}`;
    console.log(
      `\n[onboard] 项目初始化完成：${total} 阶段成功，总用时 ${formatDuration(Date.now() - startedAt)}`,
    );
    // 公共产物准备与开发者工具中的工程导入、npm 构建分别完成
    console.log("[onboard] 公共产物已就绪");
    console.log(
      "[onboard] 如需组件预览，请先运行 pnpm build:ce，再在微信开发者工具中导入 _example/",
    );
    console.log(
      "[onboard] 自建应用（如 apps/<name>/）需独立导入微信开发者工具，并通过“工具 → 构建 npm”完成 npm 构建",
    );
    return 0;
  } catch (error) {
    console.error(`[onboard] ${error.message}`);
    return controller.signal.aborted
      ? 128 + constants.signals[controller.signal.reason]
      : 1;
  } finally {
    process.removeListener("SIGINT", onSigint);
    process.removeListener("SIGTERM", onSigterm);
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.exitCode = await main();
}
