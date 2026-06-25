import { createContext } from "react";
import {
  ComputedSignal,
  IExperienceEngineStore,
  Manifest,
  ExperienceEngineContext,
} from "@contensis/experience-engine";

export interface IExperienceEngineReactContext {
  /** Singleton context object that manages the experience engine features */
  context: ExperienceEngineContext;

  /** Array of audience ids the visitor is a member of */
  audiences: string[];

  /** Array of signal ids the visitor has activated */
  signals: string[];

  /** Array of computed signals from the last time signals were computed */
  computed: ComputedSignal[];

  /** Returns true if the visitor is a member of any provided audience id */
  isAudience: (id: string | string[]) => boolean;

  /** Signals the visitor has matched in this page view */
  matched: ComputedSignal[];

  /** The manifest we are using to calculate signals and audiences */
  manifest?: Manifest;

  /** The pageViews object containing page view counts for this visitor */
  pageViews: {
    /** Number of page views accumulated in the current browser session */
    session: number;
    /** Total number of page views (recorded in localStorage) */
    total: number;
  };

  /**
    * The random bucket percentile the current visitor is placed in
    * e.g. 17.5 means for an A/B test split 20:80 we could be placed in control group A
    * and if the test were split 10:90 we could be placed in control group B
    *   @returns a number between 0 and 100 to a precision of 2
    */
  percentile: number;

  /** The experience engine store that is persisted in localStorage */
  state?: IExperienceEngineStore;

  /** The timestamp signals and audiences was last updated */
  t: EpochTimeStamp;

  /** Supply custom attributes identified within the app to the experience engine context */
  setAttributes: ExperienceEngineContext["setAttributes"];

  /** Return any custom attributes provided by the app to the experience engine context */
  getAttributes: ExperienceEngineContext["getAttributes"];

  /** Set signal attributes within the app to override the experience engine context */
  overrideAttributes: ExperienceEngineContext["overrideAttributes"];

  /** Toggle an audience on or off for use when previewing sites */
  toggleAudience: ExperienceEngineContext["toggleAudience"];
}

export const ExperienceEngineReactContext = createContext<
  ExperienceEngineContext | undefined
>(undefined);
