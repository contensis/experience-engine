import { PersonalizationContext } from "../personalization";

export interface IContensisPersonalizationGlobals {
  context?: PersonalizationContext;
  debug?: true;
  rootUrl?: string;
  alias?: string;
  projectId?: string;
  onInit?: PersonalizationContext["handlers"]["onInit"];
  onManifestReady?: PersonalizationContext["handlers"]["onManifestReady"];
  onNavigate?: PersonalizationContext["handlers"]["onNavigate"];
  onPageView?: PersonalizationContext["handlers"]["onPageView"];
  manifest?: PersonalizationContext["manifest"];
}
