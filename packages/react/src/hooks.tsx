/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useState } from "react";
import {
  IPersonalizationReactContext,
  PersonalizationReactContext,
} from "./context";
import { IManifest, PersonalizationContext } from "@contensis/personalization";

let eOnPageView: (
  context: PersonalizationContext,
  current: string,
  previous?: string | undefined
) => void | undefined;
let eOnManifestReady: (
  context: PersonalizationContext,
  manifest: IManifest
) => void | undefined;

export const usePersonalizationContext = () => {
  const context = useContext(PersonalizationReactContext);

  const [state, setState] = useState<IPersonalizationReactContext>({
    active: {
      audiences: [],
      signals: [],
    },
    context,
    matched: [],
    pageViews: {
      session: 0,
      total: 0,
    },
    t: 0,
  });

  const updateState = () => {
    if (context) {
      setState({
        active: {
          audiences: context.state.audiences?.active || [],
          signals: context.state.signals?.active || [],
        },
        context,
        matched: context.signals?.matched || [],
        manifest: context.manifest,
        pageViews: {
          session: context.pageViews.length,
          total: context.state.pageViews,
        },
        state: context.state,
        t: context.t,
      });
    }
  };

  useEffect(() => {
    if (context) {
      if (!eOnPageView) eOnPageView = context.handlers.onPageView;
      context.handlers.onPageView = (context, c, p) => {
        (context.l as any)(`handlers.onPageView`, context?.pageViews.length);
        updateState();
        eOnPageView(context, c, p);
      };
      if (!eOnManifestReady)
        eOnManifestReady = context.handlers.onManifestReady;
      context.handlers.onManifestReady = (context, manifest) => {
        (context.l as any)(
          `handlers.onManifestReady`,
          context?.pageViews.length
        );
        updateState();
        eOnManifestReady(context, manifest);
      };
    }
  }, []);

  useEffect(() => {
    updateState();
  }, [context?.pageViews.length]);

  if (!context) {
    throw new Error(
      "usePersonalizationContext must be used within a <PersonalizationContext> provider"
    );
  }
  return state;
};
