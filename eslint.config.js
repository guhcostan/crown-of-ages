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
    // A simulacao e pura: nada de tempo real/aleatoriedade global (nao-determinismo).
    // Math puro (floor, hypot, min...) e deterministico e permitido.
    files: ["src/sim/**/*.ts"],
    rules: {
      "no-restricted-globals": [
        "error",
        { name: "Date", message: "Sim deve ser deterministica. Nada de tempo real dentro de src/sim." },
        { name: "performance", message: "Sim deve ser deterministica. Nada de relogio dentro de src/sim." },
        { name: "crypto", message: "Sim deve ser deterministica. Use o RNG da partida em src/sim/rng.ts." },
      ],
      "no-restricted-properties": [
        "error",
        {
          object: "Math",
          property: "random",
          message: "Sim deve ser deterministica. Use o RNG da partida em src/sim/rng.ts.",
        },
      ],
    },
  },
  {
    files: ["tests/**/*.ts", "*.config.ts", "*.config.js"],
    rules: { "no-console": "off" },
  },
  prettier,
);
