// @ts-check
/** ESLint flat config for React libraries (packages/ui): library rules + React / React Hooks. */
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { createRequire } from "node:module";
import path from "node:path";
import library from "./library.js";

// eslint-plugin-react 7.37's `version: "detect"` calls context.getFilename(), which ESLint 10 removed.
// Resolve React from the workspace being linted instead (what "detect" did) and pass the version explicitly.
const reactVersion = createRequire(path.join(process.cwd(), "package.json"))("react/package.json").version;

export default [
  ...library,
  {
    files: ["**/*.{ts,tsx}"],
    ...react.configs.flat.recommended,
    settings: { react: { version: reactVersion } },
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
];
