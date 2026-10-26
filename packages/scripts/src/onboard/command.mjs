import { spawn } from "node:child_process";
import { access, stat } from "node:fs/promises";
import path from "node:path";
import { setTimeout } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { checkInterrupted } from "./interruption.mjs";

const repositoryRoot = fileURLToPath(new URL("../../../../", import.meta.url));

function signalProcessGroup(pid, signal) {
  try {
    process.kill(-pid, signal);
    return true;
  } catch (error) {
    if (error.code === "ESRCH") return false;
    throw error;
  }
}

async function waitForProcessGroup(pid, timeout) {
  const deadline = Date.now() + timeout;
  while (signalProcessGroup(pid, 0)) {
    if (Date.now() >= deadline) return false;
    await setTimeout(50);
  }
  return true;
}

async function terminateProcessTree(child, signal) {
  if (!child.pid) return;
  if (process.platform === "win32") {
    // 由系统一次终止整棵进程树，不能先杀根进程再查找后代
    await new Promise((resolve, reject) => {
      const systemRoot = process.env.SystemRoot ?? "C:\\Windows";
      const killer = spawn(
        path.join(systemRoot, "System32", "taskkill.exe"),
        ["/pid", String(child.pid), "/t", "/f"],
        { stdio: "ignore", windowsHide: true, timeout: 5000 },
      );
      killer.once("error", reject);
      killer.once("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`终止进程树失败（taskkill ${code}）`));
      });
    });
    return;
  }
  signalProcessGroup(child.pid, signal);
  if (await waitForProcessGroup(child.pid, 1000)) return;
  signalProcessGroup(child.pid, "SIGKILL");
  if (!(await waitForProcessGroup(child.pid, 5000))) {
    throw new Error("终止进程组超时");
  }
}

export async function runCommand(
  args,
  {
    cwd = repositoryRoot,
    packageManagerPath = process.env.npm_execpath,
    signal,
  } = {},
) {
  checkInterrupted(signal);
  if (!packageManagerPath || !path.isAbsolute(packageManagerPath)) {
    throw new Error("缺少有效的包管理器入口，请通过 pnpm onboard 运行");
  }
  if (!/\.(?:cjs|mjs|js)$/i.test(packageManagerPath)) {
    throw new Error("包管理器入口必须是可由 Node 执行的 JavaScript 文件");
  }
  if (!(await stat(packageManagerPath)).isFile()) {
    throw new Error("包管理器入口不是文件");
  }
  await access(packageManagerPath);
  checkInterrupted(signal);

  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [packageManagerPath, ...args], {
      cwd,
      stdio: "inherit",
      shell: false,
      detached: process.platform !== "win32",
    });
    let failure;
    let termination;
    const interrupt = () => {
      const exitSignal = ["SIGINT", "SIGTERM"].includes(signal.reason)
        ? signal.reason
        : "SIGTERM";
      termination ??= terminateProcessTree(child, exitSignal).catch((error) => {
        failure = error;
        child.kill("SIGKILL");
        reject(error);
      });
    };
    signal?.addEventListener("abort", interrupt, { once: true });
    child.on("error", (error) => {
      failure = error;
    });
    child.once("close", async (code, exitSignal) => {
      signal?.removeEventListener("abort", interrupt);
      // 根进程退出不代表后代已退出，中断必须等待整棵进程树清理
      await termination;
      if (failure) {
        reject(failure);
        return;
      }
      if (code !== 0 || exitSignal) {
        reject(
          new Error(`pnpm ${args.join(" ")} 失败（${exitSignal ?? code}）`),
        );
        return;
      }
      resolve();
    });
  });
  checkInterrupted(signal);
}
