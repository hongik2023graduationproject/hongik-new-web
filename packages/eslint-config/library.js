/** ESLint config for non-Next.js libraries (packages/core, packages/wasm, packages/ui). */
module.exports = {
  extends: ["./index.js"],
  rules: {
    // Libraries should not bake in console output by default; warn/error only.
    "no-console": ["error", { allow: ["warn", "error"] }],
  },
};
