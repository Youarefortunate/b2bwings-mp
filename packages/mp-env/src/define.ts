import type { MpEnvConfig } from "./types";

/**
 * 定义带有环境配置类型约束的小程序环境配置
 *
 * `envs` 中除 `common` 外的键会被自动识别为环境名
 * `common` 是公共配置保留字，`all` 是 CLI 批量切换保留字
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
 * const config = defineMpEnvConfig<AppEnvs>({
 *   envs: {
 *     common: { publicKey: "key" },
 *     test: { baseUrl: "https://test.example.com", APPID: "wx-test" },
 *     uat: { baseUrl: "https://uat.example.com", APPID: "wx-uat" },
 *     prod: { baseUrl: "https://example.com", APPID: "wx-prod" },
 *     gray: { baseUrl: "https://gray.example.com", APPID: "wx-gray" },
 *   },
 * })
 */
export function defineMpEnvConfig<TEnvs>(
  config: MpEnvConfig<TEnvs>,
): MpEnvConfig<TEnvs> {
  return config;
}
