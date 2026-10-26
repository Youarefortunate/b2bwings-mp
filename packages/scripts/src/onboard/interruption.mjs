export function checkInterrupted(signal) {
  if (signal?.aborted) {
    throw new Error(`项目初始化被 ${signal.reason} 中断`);
  }
}
