import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // eslint-config-next only enables a small hand-picked subset of jsx-a11y
  // rules; layer the full "recommended" set on top for broader coverage
  // (label associations, keyboard handlers, redundant roles, etc.). Only the
  // `rules` are pulled in — eslint-config-next already registers the
  // "jsx-a11y" plugin itself, and redeclaring it errors in flat config.
  { rules: jsxA11y.flatConfigs.recommended.rules },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored monaco-editor assets, copied by scripts/copy-monaco-assets.mjs
    "public/vs/**",
    // Runs in the ServiceWorker global scope, not the app's TS/React setup.
    "public/sw.js",
  ]),
]);

export default eslintConfig;
