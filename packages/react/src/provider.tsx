import React, { useMemo } from "react";
import { PersonalizationContext, IManifest } from "@contensis/personalization";
import { PersonalizationReactContext } from "./context";

export type PersonalizationProviderClientProps =
  | {
      alias: string;
      projectId?: string;
    }
  | {
      rootUrl: string;
      projectId?: string;
    };

export type PersonalizationProviderContextProps = {
  debug?: boolean;
  session?: boolean;
} & Partial<PersonalizationContext["handlers"]>;

export type PersonalizationProviderInstantiationProps =
  PersonalizationProviderContextProps &
    Partial<PersonalizationProviderClientProps>;

export type PersonalizationProviderProps =
  | PersonalizationProviderInstantiationProps
  | (PersonalizationProviderInstantiationProps & {
      context: PersonalizationContext;
    })
  | (PersonalizationProviderInstantiationProps & { manifest: IManifest });

/** Global context object name */
const GLOBAL = "CONTENSIS_PERSONALIZATION";

export const PersonalizationProvider = (
  props: React.PropsWithChildren<PersonalizationProviderProps>
) => {
  const currentContext = useMemo(() => {
    if ("context" in props) {
      // We have been provided a context already
      return props.context;
    } else {
      // Unwrap props to PersonalizationContext constructor arguments
      const client: PersonalizationProviderClientProps | undefined =
        "alias" in props && props.alias
          ? { alias: props.alias, projectId: props.projectId }
          : "rootUrl" in props && props.rootUrl
          ? { rootUrl: props.rootUrl, projectId: props.projectId }
          : undefined;
      const manifest =
        "manifest" in props && props.manifest ? props.manifest : undefined;

      // Create object in global scope
      const g = (globalThis[GLOBAL] =
        typeof globalThis[GLOBAL] === "object" ? globalThis[GLOBAL] : {});

      // Check for an existing context in global before instantiating a new one
      const context: PersonalizationContext = (g.context =
        g.context ||
        new PersonalizationContext({
          client,
          debug: props.debug,
          manifest,
          session: props.session || undefined,
          handlers: {
            onInit: props.onInit,
            onManifestReady: props.onManifestReady,
            onNavigate: props.onNavigate,
            onPageView: props.onPageView,
          },
        }));

      return context;
    }
  }, []);

  const { children } = props;

  return (
    <PersonalizationReactContext.Provider value={currentContext}>
      {children}
    </PersonalizationReactContext.Provider>
  );
};
