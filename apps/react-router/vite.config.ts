import basicSsl from "@vitejs/plugin-basic-ssl";
import { reactRouter } from "@react-router/dev/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {},
  },
  plugins: [
    basicSsl({
      /** name of certification */
      name: "localhost",
    }),
    reactRouter({
      // Server-side render by default, to enable SPA mode set this to `false`
      ssr: true,
    }),
    tsconfigPaths(),
  ],
});
