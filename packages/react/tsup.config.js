import { defineConfig } from "tsup";

export default defineConfig((options) => {
  const outputName = `personalization-react${options.minify ? ".min" : ""}`;
  const oneTime = !options.minify;
  return {
    entry: {
      [outputName]: "src/index.tsx",
    },
    format: ["esm", "cjs"],
    target: "es6",
    // this runs tsc to do type checking during build but the console
    // output is not as readable as vanilla tsc when there are problems to resolve
    dts: oneTime,
    sourcemap: oneTime,
    clean: oneTime,
    minify: options.minify,
  };
});
