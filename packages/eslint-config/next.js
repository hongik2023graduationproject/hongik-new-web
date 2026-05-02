/** ESLint config for the Next.js playground app. */
module.exports = {
  extends: [
    "./index.js",
    "next/core-web-vitals",
    "plugin:jsx-a11y/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  settings: {
    react: { version: "detect" },
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-hooks/exhaustive-deps": "warn",
    "react-hooks/rules-of-hooks": "error",
    "jsx-a11y/anchor-is-valid": "off", // Next.js Link component owns this
    // Allow styled-jsx attributes (`<style jsx>`, `<style jsx global>`).
    "react/no-unknown-property": ["error", { ignore: ["jsx", "global"] }],
  },
};
