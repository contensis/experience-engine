import { useContext, useEffect, useState } from "react";
import { PersonalizationContext } from "@contensis/personalization";
import {
  IPersonalizationReactContext,
  PersonalizationReactContext,
} from "../context/PersonalizationReactContext";

type PersonalizationLogger = (message: string, ...values: unknown[]) => void;

let eOnComputed: ((context: PersonalizationContext) => void) | undefined;

/** React hook that returns personalization state for you to provide personalized experiences in your components */
export const usePersonalizationContext = () => {
  const context = useContext(PersonalizationReactContext);

  const [state, setState] = useState<IPersonalizationReactContext>({
    audiences: [],
    signals: [],
    context,
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
        t,
      });
    }
  };

  useEffect(() => {
    if (context) {
      // Add "on" handlers that update react state so we can
      // trigger rerenders when data has been updated
      if (!eOnComputed) eOnComputed = context.handlers.onComputed;
      context.handlers.onComputed = (context) => {
        (context.l as PersonalizationLogger)(`handlers.onComputed`, context);
        updateState();
        eOnComputed?.(context);
      };
    }
    // Reassign existing/original "on" handlers when this component
    // is unmounted
    return () => {
      if (eOnComputed && context) {
        context.handlers.onComputed = eOnComputed;
        eOnComputed = undefined;
      }
    };
  }, []);

  useEffect(() => {
    updateState();
  }, [
    context?.pageViews.length,
    context?.t,
    context?.signals?.matched.map((s) => `${s.id}${s.times}`).join(""),
  ]);

  if (!context) {
    throw new Error(
      "usePersonalizationContext must be used within a <PersonalizationContext> provider"
    );
  }
  return state;
};
