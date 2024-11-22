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

export interface ISignalsStore {
  computed?: {
    [id: string]: { p: string; t: number; m: boolean; mm?: number }[];
  };
  matched?: { [id: string]: { p: string; t: number }[] };
  active: string[];
}

export type IAudiencesStore = ISignalsStore;
