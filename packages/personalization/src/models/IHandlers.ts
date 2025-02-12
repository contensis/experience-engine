import { PersonalizationContext } from "../personalization";
import { IManifest } from "./api/Manifest";

/** User-supplied event handlers */
export interface IHandlers {
  /** onInit event handler, called when the context is initialized */
  onInit: (context: PersonalizationContext) => void;
  /** onNavigate event handler, called when client-side navigation has been detected */
  onNavigate: (
    context: PersonalizationContext,
    current: string,
    previous?: string
  ) => void;
  /** onPageView event handler, called when a pageView has been registered and signals have been calculated */
  onPageView: (
    context: PersonalizationContext,
    current: string,
    previous?: string
  ) => void;
  /** onManifestReady event handler, called when a manifest has been loaded and signals have been calculated */
  onManifestReady: (
    context: PersonalizationContext,
    manifest: IManifest
  ) => void;
  /** onComputed event handler, called when signals and audiences have been calculated */
  onComputed: (context: PersonalizationContext) => void;
}
