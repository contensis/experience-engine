import React, { useMemo } from "react";
import {
  PersonalizationContext,
  IManifest,
  IManifestClientArgs,
  IHandlers,
} from "@contensis/personalization";
import { PersonalizationReactContext } from "./PersonalizationReactContext";

export type PersonalizationProviderContextProps = {
  /** Output console.log messaging, true or v=verbose */
  debug?: PersonalizationContext["debug"];
  /** Not implemented - Avoid localStorage and maintain signals and audiences in sessionStorage */
  session?: boolean;
  /** Request the latest Manifest version, running the Personalization Context in preview */
  preview?: boolean;
} & Partial<IHandlers>;

export type PersonalizationProviderInstantiationProps =
  PersonalizationProviderContextProps & Partial<IManifestClientArgs>;

export type PersonalizationProviderProps =
  | PersonalizationProviderInstantiationProps
  | (PersonalizationProviderInstantiationProps & {
      /** A previously instantiated Personalization Context */
      context: PersonalizationContext;
    })
  | (PersonalizationProviderInstantiationProps & {
      /** The manifest we will use to calculate signals and audiences */
      manifest: IManifest;
    });

/** Global context object name */
const GLOBAL = "CONTENSIS_PERSONALIZATION";

export const PersonalizationProvider = (
  props: React.PropsWithChildren<PersonalizationProviderProps>
) => {
  const currentContext = useMemo(() => {
    if ("context" in props && props.context) {
      // We have been provided a context already
      return props.context;
    } else {
      // Create object in global scope
      const g = (globalThis[GLOBAL] =
        typeof globalThis[GLOBAL] === "object" ? globalThis[GLOBAL] : {});

      // Unwrap props to PersonalizationContext constructor arguments
      const client =
        ("alias" in props && props.alias) ||
        ("rootUrl" in props && props.rootUrl)
          ? ({
              alias: props.alias,
              rootUrl: props.rootUrl,
              projectId: props.projectId,
              token: props.token || g.token,
            } as IManifestClientArgs)
          : undefined;
      const manifest =
        "manifest" in props && props.manifest ? props.manifest : undefined;

      // Check for an existing context in global before instantiating a new one
      const context: PersonalizationContext = (g.context =
        g.context ||
        new PersonalizationContext({
          client,
          debug: props.debug,
          manifest,
          handlers: {
            onComputed: props.onComputed,
            onInit: props.onInit,
            onManifestReady: props.onManifestReady,
            onNavigate: props.onNavigate,
            onPageView: props.onPageView,
          },
          session: props.session || undefined,
          preview: props.preview,
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
