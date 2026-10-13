import type { ViteUserConfig } from "vitest/config";

export type VitestUserConfig = ViteUserConfig;

export interface CreateVitestConfigOptions {
  /** 测试运行环境 */
  environment?: NonNullable<VitestUserConfig["test"]>["environment"];
  /** 测试文件匹配范围 */
  include?: string[];
  /** setup 文件列表 */
  setupFiles?: string[];
  /** 覆盖率统计范围 */
  coverageInclude?: string[];
  /** 覆盖率排除范围 */
  coverageExclude?: string[];
  /** 覆盖率输出目录 */
  reportsDirectory?: string;
  /** 覆盖率阈值 */
  coverageThresholds?: NonNullable<
    NonNullable<VitestUserConfig["test"]>["coverage"]
  >["thresholds"];
}

export interface CreateMiniprogramVitestConfigOptions extends CreateVitestConfigOptions {
  /** 当前包或应用根目录 */
  rootDir: string;
  /** 路径别名配置 */
  alias?: Record<string, string>;
}
