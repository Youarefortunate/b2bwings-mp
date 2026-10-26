/** @param {import("../runner.mjs").OnboardContext} context */
export async function install(context) {
  await context.runCommand(["install"]);
}
