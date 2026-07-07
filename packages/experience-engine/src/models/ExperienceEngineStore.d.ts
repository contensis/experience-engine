import {
  IOverrideAttributes,
  IBrowserSignalAttributes,
  ILocationSignalAttributes,
  IManifest,
} from "./";

export interface IExperienceEngineStore {
  cxpid: string;
  pc: number;
  pageViews: number;
  currentPage?: string;
  previousPage?: string;
  manifest?: IManifest;
  signals: ISignalsStore;
  audiences: IAudiencesStore;
  overrides?: IOverrideAttributes;
}

export interface IExperienceEngineSessionStore {
  isFirstVisit: boolean;
  startTime: string;
  duration: number;
  pageViews: number;
  lastActivity: string;
  entryPage: string;
  attribution: ISessionAttribution;
  browser: IBrowserSignalAttributes;
  referrer?: {
    url: string;
    path: string;
    querystring: string;
    queryParams: { [param: string]: string | string[] };
    domain: string;
    subdomain: string;
    baseUrl: string;
  };
  location?: ILocationSignalAttributes;
  error?: unknown;
}

export interface ISessionAttribution {
  utm_campaign?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  dclid?: string;
  msclkid?: string;
  fbclid?: string;
  ttclid?: string;
  li_fat_id?: string;
  twclid?: string;
}

export interface ISignalsStore {
  computed?: {
    [id: string]: { p: string; t: number; m: boolean; mm?: number }[];
  };
  matched?: { [id: string]: { p: string; t: number }[] };
  active: string[];
}

export type IAudiencesStore = ISignalsStore;
