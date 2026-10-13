const fs = require("fs");
const path = require("path");

/**
 * 动态向上寻找含有 pnpm-workspace.yaml 的 Workspace 根目录
 * @param {string} startDir 起始查找目录
 * @returns {string} 工作区根目录路径
 */
function findWorkspaceRoot(startDir = __dirname) {
  let currentDir = startDir;
  while (true) {
    const pnpmWorkspacePath = path.join(currentDir, "pnpm-workspace.yaml");
    if (fs.existsSync(pnpmWorkspacePath)) {
      return currentDir;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      // 达到系统根目录，采用备用降级计算方案（相对于 packages/scripts/src/utils 向上 4 级）
      return path.resolve(__dirname, "../../../..");
    }
    currentDir = parentDir;
  }
}

const workspaceRoot = findWorkspaceRoot();

/**
 * 将相对于项目工作区根目录的路径解析为物理绝对路径
 * @param {string} relativeFromRoot 相对于工作区根目录的相对路径
 * @returns {string} 物理绝对路径
 */
function resolvePath(relativeFromRoot) {
  return path.resolve(workspaceRoot, relativeFromRoot);
}

module.exports = {
  workspaceRoot,
  resolvePath,
};
