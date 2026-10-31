// @ts-check
/** ESLint flat config for libraries (packages/core, packages/wasm, packages/ui). */
import base from "./index.js";

export default [
  ...base,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Libraries should not bake in console output by default; warn/error only.
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
];
