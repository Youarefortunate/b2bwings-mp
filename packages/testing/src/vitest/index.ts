import path from "path";
import { defineConfig } from "vitest/config";
import type {
  CreateMiniprogramVitestConfigOptions,
  CreateVitestConfigOptions,
  VitestUserConfig,
} from "./types";

// 默认覆盖率阈值
const DEFAULT_THRESHOLDS = {
  statements: 90,
  branches: 90,
  functions: 90,
  lines: 90,
};

// 默认覆盖率排除范围
const DEFAULT_COVERAGE_EXCLUDE = [
  "**/*.d.ts",
  "**/*.test.ts",
  "**/*.spec.ts",
  "**/types/**",
  "**/props.ts",
];

// 默认测试文件匹配范围
const MINIPROGRAM_TEST_INCLUDE = ["**/*.{test,spec}.ts"];

// 默认覆盖率统计范围
const MINIPROGRAM_COVERAGE_INCLUDE = [
  "app.ts",
  "components/**/*.ts",
  "custom-tab-bar/**/*.ts",
  "hooks/**/*.ts",
  "lib/**/*.ts",
  "pages/**/*.ts",
  "enhancer/**/*.ts",
  "shared/**/*.ts",
  "utils/**/*.ts",
];

// 默认覆盖率排除范围
const MINIPROGRAM_COVERAGE_EXCLUDE = ["index.ts"];

/** 创建通用 Vitest 配置 */
export function createVitestConfig(
  options: CreateVitestConfigOptions = {},
): VitestUserConfig {
  const config: VitestUserConfig = {
    test: {
      globals: true,
      environment: options.environment ?? "node",
      setupFiles: options.setupFiles,
      include: options.include ?? ["tests/**/*.{test,spec}.ts"],
      reporters: ["default", "verbose"],
      clearMocks: true,
      restoreMocks: true,
      coverage: {
        provider: "v8",
        enabled: false,
        reporter: ["text", "json", "html"],
        reportsDirectory: options.reportsDirectory ?? "./coverage",
        include: options.coverageInclude,
        exclude: [
          ...DEFAULT_COVERAGE_EXCLUDE,
          ...(options.coverageExclude ?? []),
        ],
        thresholds: {
          ...DEFAULT_THRESHOLDS,
          ...options.coverageThresholds,
        },
      },
    },
  };

  return defineConfig(config) as VitestUserConfig;
}

/** 创建微信小程序 Vitest 配置 */
export function createMiniprogramVitestConfig(
  options: CreateMiniprogramVitestConfigOptions,
): VitestUserConfig {
  const alias = Object.fromEntries(
    Object.entries(options.alias ?? {}).map(([key, value]) => [
      key,
      path.resolve(options.rootDir, value),
    ]),
  );

  const config = createVitestConfig({
    ...options,
    include: options.include ?? MINIPROGRAM_TEST_INCLUDE,
    setupFiles: [
      "xbd-testing/vitest/setup/miniprogram",
      ...(options.setupFiles ?? []),
    ],
    coverageInclude: options.coverageInclude ?? MINIPROGRAM_COVERAGE_INCLUDE,
    coverageExclude: options.coverageExclude ?? MINIPROGRAM_COVERAGE_EXCLUDE,
  });

  return defineConfig({
    ...config,
    resolve: {
      ...config.resolve,
      alias,
    },
  }) as VitestUserConfig;
}
