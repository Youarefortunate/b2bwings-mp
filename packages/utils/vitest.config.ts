import { createVitestConfig } from "xbd-testing/vitest";

export default createVitestConfig({
  coverageInclude: ["src/**/*.ts"],
  coverageExclude: [
    "src/**/*.d.ts",
    "src/**/types.ts",
    "src/index.ts",
    "tests/**/*.{test,spec}.ts",
  ],
});
