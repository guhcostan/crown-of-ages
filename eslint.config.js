import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: ["dist", "node_modules", "test-results", "playwright-report", "docs/spec-parts"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      eqeqeq: ["error", "always"],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    // A simulacao e pura: nada de Math.random/Date.now (nao-determinismo).
    files: ["src/sim/**/*.ts"],
    rules: {
      "no-restricted-globals": [
        "error",
        { name: "Math", message: "Sim deve ser deterministica. Use src/sim/rng.ts (semente fixa)." },
        { name: "Date", message: "Sim deve ser deterministica. Nada de tempo real dentro de src/sim." },
      ],
    },
  },
  {
    files: ["tests/**/*.ts", "*.config.ts", "*.config.js"],
    rules: { "no-console": "off" },
  },
  prettier,
);
