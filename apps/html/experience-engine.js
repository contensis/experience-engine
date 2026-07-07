/** Create a new script element */
const scriptEl = document.createElement("script");

/** Set data attributes to provide options to create the experience engine context */
scriptEl.setAttribute("data-contensis-xp-alias", "develop");
scriptEl.setAttribute("data-contensis-xp-project-id", "website");
scriptEl.setAttribute("data-contensis-xp-preview", "true");
scriptEl.setAttribute("data-contensis-xp-debug", "true");
scriptEl.setAttribute(
  "src",
  "/../../packages/experience-engine/dist/experience-engine.browser.min.mjs"
);
scriptEl.setAttribute("type", "module");

/** Append the script tag to our DOM head */
document.head.appendChild(scriptEl);
