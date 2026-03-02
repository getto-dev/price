import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  ...tseslint.configs.recommended,
  {
    ignores: [".next/**", "node_modules/**", "out/**", "public/sw.js", "eslint.config.mjs"],
  },
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
