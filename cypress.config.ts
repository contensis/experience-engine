import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "m6esjw",
  e2e: {
    baseUrl: "https://localhost:5173",
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
