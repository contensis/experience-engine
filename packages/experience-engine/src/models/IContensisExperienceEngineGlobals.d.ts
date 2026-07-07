import { ExperienceEngineContext } from "../experience-engine";

export interface IContensisExperienceEngineGlobals {
  token?: string; // TODO: remove this
  context?: ExperienceEngineContext;
  debug?: true;
  rootUrl?: string;
  alias?: string;
  projectId?: string;
  onComputed?: ExperienceEngineContext["handlers"]["onComputed"];
  onInit?: ExperienceEngineContext["handlers"]["onInit"];
  onManifestReady?: ExperienceEngineContext["handlers"]["onManifestReady"];
  onNavigate?: ExperienceEngineContext["handlers"]["onNavigate"];
  onPageView?: ExperienceEngineContext["handlers"]["onPageView"];
  manifest?: ExperienceEngineContext["manifest"];
}
