/** Create a new script element */
const scriptEl = document.createElement("script");

/** Set data attributes to provide options to create the personalisation context */
scriptEl.setAttribute(
  "data-contensis-personalization-root-url",
  "https://personalization-api-contensis-dev.services.contensis.com"
);
scriptEl.setAttribute("data-contensis-personalization-project-id", "website");
scriptEl.setAttribute("data-contensis-personalization-debug", "true");
scriptEl.setAttribute(
  "src",
  "/../../packages/personalization/dist/personalization.browser.min.mjs"
);
scriptEl.setAttribute("type", "module");

/** Append the script tag to our DOM head */
document.head.appendChild(scriptEl);
