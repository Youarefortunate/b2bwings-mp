import { createVitestConfig } from "./src/vitest/index";

export default createVitestConfig({
  coverageInclude: ["src/**/*.ts"],
  coverageExclude: ["src/index.ts", "src/vitest/setup/**/*.ts"],
});
