import React, { useMemo } from "react";
import {
  ExperienceEngineContext,
  IManifest,
  IManifestClientArgs,
  IHandlers,
} from "@contensis/experience-engine";
import { ExperienceEngineReactContext } from "./ExperienceEngineReactContext";

export type ExperienceEngineProviderContextProps = {
  /** Output console.log messaging, true or v=verbose */
  debug?: ExperienceEngineContext["debug"];
  /** Not implemented - Avoid localStorage and maintain signals and audiences in sessionStorage */
  session?: boolean;
  /** Request the latest Manifest version, running the Experience Engine Context in preview */
  preview?: boolean;
} & Partial<IHandlers>;

export type ExperienceEngineProviderInstantiationProps =
  ExperienceEngineProviderContextProps & Partial<IManifestClientArgs>;

export type ExperienceEngineProviderProps =
  | ExperienceEngineProviderInstantiationProps
  | (ExperienceEngineProviderInstantiationProps & {
      /** A previously instantiated Experience Engine Context */
      context: ExperienceEngineContext;
    })
  | (ExperienceEngineProviderInstantiationProps & {
      /** The manifest we will use to calculate signals and audiences */
      manifest: IManifest;
    });

/** Global context object name */
const GLOBAL = "CONTENSIS_XP";

export const ExperienceEngineProvider = (
  props: React.PropsWithChildren<ExperienceEngineProviderProps>
) => {
  const currentContext = useMemo(() => {
    if ("context" in props && props.context) {
      // We have been provided a context already
      return props.context;
    } else {
      // Create object in global scope
      const g = (globalThis[GLOBAL] =
        typeof globalThis[GLOBAL] === "object" ? globalThis[GLOBAL] : {});

      // Unwrap props to ExperienceEngineContext constructor arguments
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
      const context: ExperienceEngineContext = (g.context =
        g.context ||
        new ExperienceEngineContext({
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
    <ExperienceEngineReactContext.Provider value={currentContext}>
      {children}
    </ExperienceEngineReactContext.Provider>
  );
};
