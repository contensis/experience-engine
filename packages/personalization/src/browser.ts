import {
  PersonalizationContext,
  PersonalizationContextOptions,
} from "./personalization";
import { isObject } from "./util";

/** Add complete HTML Attribute Name Prefix */
const getDataAttributeName = (dataId: string) =>
  `data-contensis-personalization-${dataId}`;

/** Get context options set in any HTML data-* attributes */
const getAttributes = (element: Element): PersonalizationContextOptions => {
  const getDataAttribute = <T = undefined>(
    dataId: string,
    defaultValue?: T
  ): string | T =>
    element.getAttribute(getDataAttributeName(dataId)) || (defaultValue as T);

  const alias = getDataAttribute("alias");
  const rootUrl = getDataAttribute("root-url");
  const projectId = getDataAttribute("project-id");
  const debug = ["true", "1"].includes(getDataAttribute("debug", ""));
  const client = rootUrl
    ? { rootUrl, projectId }
    : alias
    ? { alias, projectId }
    : undefined;
  return {
    client,
    debug,
  };
};
let constructor: PersonalizationContextOptions = {};

/** Select the element containing the HTML data-* attributes */
const element =
  document.currentScript ||
  document.querySelector(
    `[${getDataAttributeName("alias")}],[${getDataAttributeName("root-url")}]`
  );

if (element) constructor = getAttributes(element);

/** Global context object name */
const GLOBAL = "CONTENSIS_PERSONALIZATION";

if (isObject(window[GLOBAL])) {
  /** Add any options previously set in the globalThis/window context */
  constructor.manifest = window[GLOBAL].manifest;
  constructor.debug = window[GLOBAL].debug;
  constructor.handlers = {
    onInit: window[GLOBAL].onInit,
    onManifestReady: window[GLOBAL].onManifestReady,
    onNavigate: window[GLOBAL].onNavigate,
    onPageView: window[GLOBAL].onPageView,
  };
} else window[GLOBAL] = {};

/**
 * Instantiate a personalization context and add it to the global context
 * or use an existing context stored in the global if it exists
 */
window[GLOBAL].context =
  window[GLOBAL].context || new PersonalizationContext(constructor);
