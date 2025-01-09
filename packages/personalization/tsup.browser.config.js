import { defineConfig } from "tsup";

export default defineConfig((options) => {
  const outputName = `personalization.browser${options.minify ? ".min" : ""}`;

  return {
    entry: {
      [outputName]: "src/browser.ts",
    },
    // splitting: true,
    // outDir: "dist",
    format: ["esm", "cjs"],
    target: "es6",
    // this runs tsc to do type checking during build but the console
    // output is not as readable as vanilla tsc when there are problems to resolve
    dts: false,
    sourcemap: false,
    minify: options.minify,
  };
});
