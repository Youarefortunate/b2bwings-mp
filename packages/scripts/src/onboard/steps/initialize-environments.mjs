/** @param {import("../runner.mjs").OnboardContext} context */
export async function initializeEnvironments(context) {
  await context.runCommand(["--filter", "xbd-mp-env", "run", "env:init"]);
}
