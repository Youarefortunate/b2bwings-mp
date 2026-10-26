/** 单个小程序环境的对象配置项 */
export type MpEnvItem = object;

/**
 * 将应用自有环境映射约束为普通对象集合
 *
 * @typeParam TEnvs 应用完整的环境名称与配置项映射
 */
export type MpEnvs<TEnvs> = {
  [TEnvName in keyof TEnvs]: TEnvs[TEnvName] extends readonly unknown[]
    ? never
    : TEnvs[TEnvName] extends (...args: never[]) => unknown
      ? never
      : TEnvs[TEnvName] extends MpEnvItem
        ? TEnvs[TEnvName]
        : never;
};

/**
 * 小程序环境配置的公开结构
 *
 * @typeParam TEnvs 应用完整的环境名称与配置项映射
 */
export interface MpEnvConfig<TEnvs> {
  /** 按环境名称组织的配置项 */
  envs: MpEnvs<TEnvs>;
  /** 初始化时使用的默认环境，排除公共配置与批量切换保留字 */
  defaultEnv?: Exclude<Extract<keyof TEnvs, string>, "common" | "all">;
}
