module.exports = {
  root: true,
  extends: ["@hongik/eslint-config/library", "plugin:react/recommended", "plugin:react-hooks/recommended"],
  settings: {
    react: { version: "detect" },
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
  },
};
