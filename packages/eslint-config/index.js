/** Base ESLint config shared by every workspace. */
module.exports = {
  root: false,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  env: {
    es2022: true,
    node: true,
    browser: true,
  },
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      { prefer: "type-imports", fixStyle: "inline-type-imports" },
    ],
    "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    eqeqeq: ["error", "smart"],
  },
  ignorePatterns: [
    "dist/",
    ".next/",
    "node_modules/",
    "coverage/",
    "*.config.js",
    "*.config.ts",
  ],
};
