import fs from "node:fs";
import path from "node:path";

/** 已接入环境切换的小程序应用 */
export interface DiscoveredApp {
  /** apps/ 下的目录名 */
  name: string;
  /** app 根目录绝对路径 */
  dir: string;
  /** env.config 文件绝对路径 */
  configFile: string;
}

/** 环境配置文件支持的扩展名（按优先级） */
const CONFIG_EXTENSIONS = [".ts", ".js"] as const;

/**
 * 扫描 apps 目录，返回所有存在 env.config.ts / env.config.js 的应用
 * 目录不存在返回空数组，结果按名称排序保证输出稳定
 */
export function discoverApps(appsDir: string): DiscoveredApp[] {
  if (!fs.existsSync(appsDir)) return [];

  const apps: DiscoveredApp[] = [];
  for (const entry of fs.readdirSync(appsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const appDir = path.join(appsDir, entry.name);
    for (const ext of CONFIG_EXTENSIONS) {
      const configFile = path.join(appDir, `env.config${ext}`);
      if (fs.existsSync(configFile)) {
        apps.push({ name: entry.name, dir: appDir, configFile });
        break;
      }
    }
  }
  return apps.sort((a, b) => a.name.localeCompare(b.name));
}
