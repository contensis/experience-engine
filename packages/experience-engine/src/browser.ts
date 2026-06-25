import {
  GLOBAL,
  ExperienceEngineContext,
  ExperienceEngineContextOptions,
} from "./experience-engine";
import { IManifestClientArgs } from "./providers/manifest";
import { isObject } from "./util";

/** Add complete HTML Attribute Name Prefix */
const getDataAttributeName = (dataId: string) =>
  `data-contensis-xp-${dataId}`;

/** Get context options set in any HTML data-* attributes */
const getAttributes = (element: Element): ExperienceEngineContextOptions => {
  const getDataAttribute = <T = undefined>(
    dataId: string,
    defaultValue?: T
  ): string | T =>
    element.getAttribute(getDataAttributeName(dataId)) || (defaultValue as T);

  const alias = getDataAttribute("alias");
  const rootUrl = getDataAttribute("root-url");
  const projectId = getDataAttribute("project-id");
  const debug = ["true", "1"].includes(getDataAttribute("debug", ""));
  const preview = ["true", "1"].includes(getDataAttribute("preview", ""));
  const client =
    rootUrl || alias
      ? ({ alias, rootUrl, projectId, preview } as IManifestClientArgs)
      : undefined;
  return {
    client,
    debug,
    preview,
  };
};
let constructor: ExperienceEngineContextOptions = {};

/** Select the element containing the HTML data-* attributes */
const element =
  document.currentScript ||
  document.querySelector(
    `[${getDataAttributeName("alias")}],[${getDataAttributeName("root-url")}]`
  );

if (element) constructor = getAttributes(element);

/** Declare const for effective minification */
const w = window;
const g = w[GLOBAL];

if (isObject(g)) {
  /** Add any options previously set in the globalThis/window context */
  constructor.manifest = g.manifest;
  constructor.debug = g.debug;
  constructor.handlers = {
    onComputed: g.onComputed,
    onInit: g.onInit,
    onManifestReady: g.onManifestReady,
    onNavigate: g.onNavigate,
    onPageView: g.onPageView,
  };
} else w[GLOBAL] = {};

/**
 * Instantiate a personalization context and add it to the global context
 * or use an existing context stored in the global if it exists
 */
w[GLOBAL].context =
  w[GLOBAL].context || new ExperienceEngineContext(constructor);
