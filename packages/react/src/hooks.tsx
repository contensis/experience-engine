import { useCallback, useContext, useEffect, useState } from "react";
import { IManifest, PersonalizationContext } from "@contensis/personalization";
import {
  IPersonalizationReactContext,
  PersonalizationReactContext,
} from "./context";

type PersonalizationLogger = (message: string, ...values: unknown[]) => void;

let eOnPageView:
  | ((
      context: PersonalizationContext,
      current: string,
      previous?: string | undefined
    ) => void)
  | undefined;

let eOnManifestReady:
  | ((context: PersonalizationContext, manifest: IManifest) => void)
  | undefined;

/** React hook that returns personalization state for you to provide personalized experiences in your components */
export const usePersonalizationContext = () => {
  const context = useContext(PersonalizationReactContext);

  const [state, setState] = useState<IPersonalizationReactContext>({
    audiences: [],
    signals: [],
    context,
    isAudience: () => false,
    matched: [],
    pageViews: {
      session: 0,
      total: 0,
    },
    percentile: 0,
    t: 0,
  });

  const isAudience = useCallback(
    (id: string | string[]) =>
      Array.isArray(id)
        ? id.some((item) => state.audiences.includes(item))
        : state.audiences.includes(id),
    [state.audiences.join("~")]
  );

  const updateState = () => {
    if (context) {
      const { manifest, pageViews, percentile, state, t } = context;
      const { audiences, signals } = state;
      setState({
        audiences: audiences?.active || [],
        signals: signals?.active || [],
        context,
        isAudience,
        matched: context.signals?.matched || [],
        manifest,
        pageViews: {
          session: pageViews.length,
          total: state.pageViews,
        },
        percentile,
        state,
        t,
      });
    }
  };

  useEffect(() => {
    if (context) {
      if (!eOnPageView) eOnPageView = context.handlers.onPageView;
      context.handlers.onPageView = (context, c, p) => {
        (context.l as PersonalizationLogger)(
          `handlers.onPageView`,
          context?.pageViews.length
        );
        updateState();
        eOnPageView?.(context, c, p);
      };
      if (!eOnManifestReady)
        eOnManifestReady = context.handlers.onManifestReady;
      context.handlers.onManifestReady = (context, manifest) => {
        (context.l as PersonalizationLogger)(
          `handlers.onManifestReady`,
          context?.pageViews.length
        );
        updateState();
        eOnManifestReady?.(context, manifest);
      };
    }
  }, []);

  useEffect(() => {
    updateState();
  }, [context?.pageViews.length, isAudience]);

  if (!context) {
    throw new Error(
      "usePersonalizationContext must be used within a <PersonalizationContext> provider"
    );
  }
  return state;
};
