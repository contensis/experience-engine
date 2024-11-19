import { defineConfig } from "tsup";
import path from "path";
const tsconfig = path.resolve(__dirname, "../../tsconfig.build.json");
console.log(tsconfig);
export default defineConfig({
  // tsconfig,
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
