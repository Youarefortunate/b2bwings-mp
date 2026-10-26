import { initializeEnvironments } from "./steps/initialize-environments.mjs";
import { install } from "./steps/install.mjs";
import { prepareComponents } from "./steps/prepare-components.mjs";
import { prepareUtils } from "./steps/prepare-utils.mjs";

/** @type {import("./runner.mjs").OnboardStage[]} */
export const stages = [
  {
    name: "install",
    label: "安装依赖",
    tasks: [install],
  },
  {
    name: "initialize-environments",
    label: "初始化环境",
    tasks: [initializeEnvironments],
  },
  {
    name: "prepare-utils",
    label: "准备工具库产物",
    tasks: [prepareUtils],
  },
  {
    name: "prepare-components",
    label: "准备组件产物",
    tasks: [prepareComponents],
  },
];
