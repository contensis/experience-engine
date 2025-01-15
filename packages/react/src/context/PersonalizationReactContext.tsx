import { createContext } from "react";
import {
  ComputedSignal,
  IManifest,
  IPersonalizationStore,
  PersonalizationContext,
} from "@contensis/personalization";

export interface IPersonalizationReactContext {
  /** The main PersonalizationContext object */
  context?: PersonalizationContext;

  /** Array of audience ids the visitor is a member of */
  audiences: string[];

  /** Array of signal ids the visitor has activated */
  signals: string[];

  /** Returns true if the visitor is a member of any provided audience id */
  isAudience: (id: string | string[]) => boolean;

  /** Signals the vistor has matched in this page view */
  matched: ComputedSignal[];
  /** The manifest we are using to calculate signals and audiences */
  manifest?: IManifest;

  /** The pageViews object containing page view counts for this visitor */
  pageViews: {
    /** Number of page views accumulated since the current PersonalizationContext was created */
    session: number;
    /** Total number of page views(recorded in localStorage) */
    total: number;
  };

  /**
   * The random bucket percentile the current visitor is placed in
   * e.g. 17.5 means for an A/B test split 20:80 we could be placed in control group A
   * and if the test were split 10:90 we could be placed in control group B
   *   @returns a number between 0 and 100 to a precision of 2
   */
  percentile: number;

  /** The personalization store that is persisted in localStorage */
  state?: IPersonalizationStore;

  /** The timestamp signals and audiences was last updated */
  t: EpochTimeStamp;
}

export const PersonalizationReactContext = createContext<
  PersonalizationContext | undefined
>(undefined);
