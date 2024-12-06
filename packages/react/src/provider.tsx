import React, { useMemo } from "react";
import { PersonalizationContext, IManifest } from "@contensis/personalization";
import { PersonalizationReactContext } from "./context";

export type PersonalizationProviderInstantiationProps = {
  alias?: string;
  projectId?: string;
  session?: boolean;
};

export type PersonalizationProviderProps =
  | PersonalizationProviderInstantiationProps
  | (PersonalizationProviderInstantiationProps & {
      context: PersonalizationContext;
    })
  | (PersonalizationProviderInstantiationProps & { manifest: IManifest });

export const PersonalizationProvider = (
  props: React.PropsWithChildren<PersonalizationProviderProps>
) => {
  const currentContext = useMemo(() => {
    if ("context" in props) {
      // We have been provided a context already
      return props.context;
    }
    // Unwrap props
    const client =
      "alias" in props && props.alias
        ? { alias: props.alias || "", projectId: props.projectId || "" }
        : undefined;
    const manifest =
      "manifest" in props && props.manifest ? props.manifest : undefined;
    const session = props.session || undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalAny = globalThis as any;

    // To avoid double-rendering issues check for a cpcontext in global
    const context: PersonalizationContext =
      globalAny.cpcontext ||
      new PersonalizationContext({ client, manifest, session });

    // Hoist the context to global scope so we can pick it back up in subsequent re-renders
    globalAny.cpcontext = context;
    return context;
  }, []);

  const { children } = props;

  return (
    <PersonalizationReactContext.Provider value={currentContext}>
      {children}
    </PersonalizationReactContext.Provider>
  );
};
