import { createContext } from "react";
import {
  ComputedSignal,
  IManifest,
  IPersonalizationStore,
  PersonalizationContext,
} from "@contensis/personalization";

export interface IPersonalizationReactContext {
  context?: PersonalizationContext;
  active: {
    audiences: string[];
    signals: string[];
  };
  matched: ComputedSignal[];
  manifest?: IManifest;
  pageViews: {
    session: number;
    total: number;
  };
  state?: IPersonalizationStore;
  t: EpochTimeStamp;
}

export const PersonalizationReactContext = createContext<
  PersonalizationContext | undefined
>(undefined);
