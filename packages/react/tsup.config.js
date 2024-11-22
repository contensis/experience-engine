import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    ["personalization-react"]: "src/index.tsx",
  },
  format: ["esm", "cjs"],
  target: "es6",
  // this runs tsc to do type checking during build but the console
  // output is not as readable as vanilla tsc when there are problems to resolve
  dts: true,
  sourcemap: true,
  clean: true,
});
