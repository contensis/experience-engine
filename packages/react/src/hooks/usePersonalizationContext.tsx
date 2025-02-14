import { useContext, useEffect, useState } from "react";
import { PersonalizationContext } from "@contensis/personalization";
import {
  IPersonalizationReactContext,
  PersonalizationReactContext,
} from "../context/PersonalizationReactContext";

/** React hook that returns personalization state for you to provide personalized experiences in your components */
export const usePersonalizationContext = () => {
  const context = useContext(PersonalizationReactContext);

  const [state, setState] = useState<IPersonalizationReactContext>({
    audiences: [],
    signals: [],
    context: context as PersonalizationContext,
    computed: [],
    isAudience: () => false,
    matched: [],
    pageViews: {
      session: 0,
      total: 0,
    },
    percentile: 0,
    setAttributes: () => {},
    overrideAttributes: () => {},
    toggleAudience: () => {},
    t: 0,
  });

  const updateState = () => {
    if (context) {
      const {
        manifest,
        overrideAttributes,
        percentile,
        session,
        setAttributes,
        state,
        t,
      } = context;
      const audiences = state.audiences?.active || [];
      const signals = state.signals?.active || [];
      setState({
        audiences,
        signals,
        computed: context.signals?.computed || [],
        context,
        isAudience: (id: string | string[]) =>
          Array.isArray(id)
            ? id.some((item) => audiences.includes(item))
            : audiences.includes(id),
        matched: context.signals?.matched || [],
        manifest,
        overrideAttributes,
        pageViews: {
          session: session.state.pageViews,
          total: state.pageViews,
        },
        percentile,
        setAttributes,
        state,
        toggleAudience: context.toggleAudience,
        t,
      });
    }
  };

  useEffect(() => {
    // Add "on" handlers that update react state so we can
    // trigger rerenders when data has been updated
    const computedHandler = context?.addHandler("onComputed", () => {
      updateState();
    });

    const manifestHandler = context?.addHandler("onManifestReady", () => {
      updateState();
    });

    // Remove any "on" handlers when this component
    // is unmounted
    return () => {
      if (computedHandler)
        context?.removeHandler("onComputed", computedHandler);
      if (manifestHandler)
        context?.removeHandler("onManifestReady", manifestHandler);
    };
  }, []);

  useEffect(() => {
    updateState();
    // console.log(`updateState:`, context?.t);
  }, [context?.pageViews.length, context?.t]);

  if (!context) {
    throw new Error(
      "usePersonalizationContext must be used within a <PersonalizationContext> provider"
    );
  }
  return state;
};
