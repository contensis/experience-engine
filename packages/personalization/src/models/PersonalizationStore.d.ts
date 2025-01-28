import {
  IBrowserSignalAttributes,
  ILocationSignalAttributes,
  IManifest,
} from "./";

export interface IPersonalizationStore {
  cpid: string;
  pc: number;
  pageViews: number;
  currentPage?: string;
  previousPage?: string;
  manifest?: IManifest;
  signals?: ISignalsStore;
  audiences?: IAudiencesStore;
}

export interface IPersonalizationSessionStore {
  isFirstVisit: boolean;
  startTime: string;
  duration: number;
  pageViews: number;
  lastActivity: string;
  entryPage: string;
  browser: IBrowserSignalAttributes;
  referrer?: {
    url: string;
    path: string;
    querystring;
    queryParams: { [param: string]: string };
    domain: string;
    subdomain: string;
    baseUrl: string;
  };
  location?: ILocationSignalAttributes;
}

export interface ISignalsStore {
  computed?: {
    [id: string]: { p: string; t: number; m: boolean; mm?: number }[];
  };
  matched?: { [id: string]: { p: string; t: number }[] };
  active: string[];
}

export type IAudiencesStore = ISignalsStore;
