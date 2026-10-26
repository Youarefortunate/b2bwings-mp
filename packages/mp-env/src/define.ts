import type { MpEnvConfig } from "./types";

/**
 * 定义带有环境配置类型约束的小程序环境配置
 *
 * `envs` 中除 `common` 外的键会被自动识别为环境名
 * `common` 是公共配置保留字，`all` 是 CLI 批量切换保留字
 * `defaultEnv` 可选，初始化时必须指定有效环境；显式切换不依赖该字段
 *
 * @typeParam TEnvs 应用完整的环境名称与配置项映射
 * @param config 小程序环境配置
 * @returns 传入的原始配置对象
 * @example
 * interface AppEnvs {
 *   common: { publicKey: string }
 *   test: { baseUrl: string; APPID: string }
 *   uat: { baseUrl: string; APPID: string }
 *   prod: { baseUrl: string; APPID: string }
 *   gray: { baseUrl: string; APPID: string }
 * }
 *
 * // 1、声明环境：apps/<name>/env.config.ts（本文件是唯一需要手写的环境配置）
 * export default defineMpEnvConfig<AppEnvs>({
 *   defaultEnv: "test", // 值可选 -> test | uat | prod | gray
 *   envs: {
 *     common: { publicKey: "key" },
 *     test: { baseUrl: "https://test.example.com", APPID: "wx-test" },
 *     uat: { baseUrl: "https://uat.example.com", APPID: "wx-uat" },
 *     prod: { baseUrl: "https://example.com", APPID: "wx-prod" },
 *     gray: { baseUrl: "https://gray.example.com", APPID: "wx-gray" },
 *   },
 * })
 *
 * // 2、业务代码消费：从 "@/config" 读取当前环境配置，不感知环境名
 * import config from "@/config"
 * const baseUrl = config.baseUrl
 * const publicKey = config.publicKey // 使用所有环境都有的公共配置
 */
export function defineMpEnvConfig<TEnvs>(
  config: MpEnvConfig<TEnvs>,
): MpEnvConfig<TEnvs> {
  return config;
}
