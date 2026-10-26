import {
  discoverComponentArtifacts,
  findMissingArtifacts,
} from "../artifacts.mjs";

const PACKAGE_NAME = "xbd-miniprogram";
/** 强制忽略 Turbo 缓存，只在本次确认缺失时使用 */
const COMMAND = ["build:c", "--force"];
/** 缺失摘要只展示前若干条，避免长列表淹没阶段输出 */
const SAMPLE_LIMIT = 5;

const summarize = (paths) => {
  const shown = paths.slice(0, SAMPLE_LIMIT).join("\n  ");
  const omitted =
    paths.length > SAMPLE_LIMIT ? `\n  ...（共 ${paths.length} 个）` : "";
  return `\n  ${shown}${omitted}`;
};

/**
 * 组件库阶段：从参与分发构建的源码映射必要产物，齐全则跳过，缺失则强制构建并复查
 * 复用入口注入的 context，不覆盖其中的绑定能力
 * @param {{ root: string, signal: AbortSignal, runCommand: (args: string[]) => Promise<void>, checkInterrupted: () => void }} context
 */
export async function prepareComponents(context) {
  const { root, signal, runCommand, checkInterrupted } = context;
  checkInterrupted();
  const artifacts = await discoverComponentArtifacts(root, { signal });
  const missing = await findMissingArtifacts(artifacts, {
    signal,
    label: PACKAGE_NAME,
  });
  if (missing.length === 0) {
    console.log(`[onboard] ${PACKAGE_NAME} 必要产物齐全，跳过构建`);
    return;
  }

  console.log(
    `[onboard] ${PACKAGE_NAME} 缺少 ${missing.length} 个必要产物，开始构建：${summarize(missing)}`,
  );
  await runCommand(COMMAND);
  checkInterrupted();

  const remaining = await findMissingArtifacts(artifacts, {
    signal,
    label: PACKAGE_NAME,
  });
  if (remaining.length > 0) {
    throw new Error(
      `${PACKAGE_NAME} 构建后复查失败，仍缺少 ${remaining.length} 个必要产物：${summarize(remaining)}`,
    );
  }
  console.log(`[onboard] ${PACKAGE_NAME} 构建完成，复查通过`);
}
