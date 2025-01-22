import { defineConfig } from "tsup";
import browserslist from "browserslist-to-esbuild";

export default defineConfig((options) => {
  const outputName = `personalization${options.minify ? ".min" : ""}`;

  const oneTime = !options.minify;

  const target = browserslist([
    "last 10 Chrome versions",
    "last 20 ChromeAndroid versions",
    "last 5 Safari versions",
    "last 3 iOS versions",
    "last 10 Firefox versions",
    "last 10 FirefoxAndroid versions",
    "last 5 Edge versions",
    "Firefox ESR",
    "not dead",
    "> 10% in DE",
  ]);

  return [
    // Regular bundles
    {
      bundle: true,
      entry: {
        [outputName]: "src/index.ts",
      },
      // splitting: true,
      format: ["esm", "cjs"],
      target,
      // this runs tsc to do type checking during build but the console
      // output is not as readable as vanilla tsc when there are problems to resolve
      dts: oneTime,
      sourcemap: false,
      clean: oneTime,
      minify: options.minify,
    },
    // Browser entrypoint bundles
    {
      bundle: true,
      entry: {
        [`personalization.browser${options.minify ? ".min" : ""}`]:
          "src/browser.ts",
      },
      // splitting: true,
      format: ["esm", "cjs"],
      target,
      dts: false,
      sourcemap: false,
      minify: options.minify,
    },
  ];
});
