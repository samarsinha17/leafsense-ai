import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist", "node_modules", "*.tsbuildinfo", "vite.config.d.ts"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}", "*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        document: "readonly",
        window: "readonly",
        localStorage: "readonly",
        navigator: "readonly",
        URL: "readonly",
        Blob: "readonly",
        File: "readonly",
        FormData: "readonly",
        HTMLElement: "readonly",
        HTMLScriptElement: "readonly",
        FileReader: "readonly",
        Image: "readonly",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
];
