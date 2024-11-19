import React, { useMemo } from "react";
import { PersonalizationContext } from "@contensis/personalization";
import { PersonalizationReactContext } from "./context";

export type PersonalizationProviderInstantiationProps = {};

export type PersonalizationProviderProps =
  | PersonalizationProviderInstantiationProps
  | { context: PersonalizationContext };

export const PersonalizationProvider = (
  props: React.PropsWithChildren<PersonalizationProviderProps>
) => {
  const currentContext = useMemo(() => {
    if ("context" in props) {
      return props.context;
    }

    // To avoid double-rendering issues hoist the context to global scope so we can pick it back up later
    const context = (globalThis as any).context || new PersonalizationContext();
    (globalThis as any).context = context;
    return context;
  }, []);

  const { children } = props;

  return (
    <PersonalizationReactContext.Provider value={currentContext}>
      {children}
    </PersonalizationReactContext.Provider>
  );
};
