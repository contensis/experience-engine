import eslint from "@eslint/js";
import pluginCypress from "eslint-plugin-cypress/flat";
import pluginChaiFriendly from "eslint-plugin-chai-friendly";
import pluginMocha from "eslint-plugin-mocha";
import tseslint from "typescript-eslint";

export default tseslint.defineConfig(
  {
    ignores: ["**/dist/", "**/node_modules/**"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  pluginMocha.configs.flat.recommended,
  pluginCypress.configs.recommended,
  pluginChaiFriendly.configs.recommendedFlat,
  {
    plugins: {
      cypress: pluginCypress,
    },
    rules: {
      "cypress/no-unnecessary-waiting": "error",
      "cypress/unsafe-to-chain-command": "error",
      "mocha/no-mocha-arrows": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/member-ordering": "error",
    },
  }
);
