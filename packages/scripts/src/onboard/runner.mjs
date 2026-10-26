import { checkInterrupted } from "./interruption.mjs";

const stageRule = "─".repeat(44);

const stageTitle = (stage) => stage.label ?? stage.name;

export const formatDuration = (ms) => `${(ms / 1000).toFixed(1)}s`;

const stageElapsed = (startedAt) =>
  `（用时 ${formatDuration(Date.now() - startedAt)}）`;

/**
 * 阶段按依赖顺序串行；同阶段任务并行且必须相互独立，不得共享写入
 * @typedef {object} OnboardContext
 * @property {string} root 仓库根目录
 * @property {AbortSignal} signal 本次运行的取消信号
 * @property {(args: string[]) => Promise<void>} runCommand 绑定根目录和信号的命令
 * @property {() => void} checkInterrupted 检查本次运行是否中断
 * @typedef {(context: OnboardContext) => Promise<unknown>} OnboardStep
 * 步骤必须等待自身全部工作；抛错表示失败，返回值不参与调度
 * @typedef {object} OnboardStage
 * @property {string} name 阶段标识
 * @property {string} [label] 阶段显示名称
 * @property {OnboardStep[]} tasks 阶段任务
 * @param {OnboardStage[]} stages
 * @param {OnboardContext} context 完整原样传给每个步骤
 */
export async function runStages(stages, context = {}) {
  const { signal } = context;
  for (const [index, stage] of stages.entries()) {
    checkInterrupted(signal);
    const position = `${index + 1}/${stages.length}`;
    const title = stageTitle(stage);
    const startedAt = Date.now();
    // 阶段头与正文用独立分隔线隔开，避免被任务自身输出淹没
    console.log(`\n[onboard] ${stageRule}`);
    console.log(`[onboard] 阶段 ${position}：${title}`);
    console.log(`[onboard] ${stageRule}`);
    const results = await Promise.allSettled(
      stage.tasks.map((task) => Promise.resolve().then(() => task(context))),
    );
    const failures = results.filter((result) => result.status === "rejected");
    if (failures.length > 0) {
      throw new AggregateError(
        failures.map((result) => result.reason),
        `阶段 ${position}：${title} 失败：${failures
          .map((result) => result.reason.message)
          .join("；")}`,
      );
    }
    checkInterrupted(signal);
    console.log(
      `[onboard] 阶段 ${position}：${title} 完成${stageElapsed(startedAt)}`,
    );
  }
}
