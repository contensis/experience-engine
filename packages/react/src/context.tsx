import { createContext } from "react";
import { PersonalizationContext } from "@contensis/personalization";

export const PersonalizationReactContext = createContext<
  PersonalizationContext | undefined
>(undefined);
