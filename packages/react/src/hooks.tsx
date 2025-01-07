import { useContext, useEffect, useState } from "react";
import { PersonalizationReactContext } from "./context";
import { ComputedSignal } from "@contensis/personalization";

export const usePersonalizationContext = () => {
  const context = useContext(PersonalizationReactContext);

  const [active, setActive] = useState<{
    audiences: string[];
    signals: string[];
  }>({ audiences: [], signals: [] });

  const [pageViews, setPageViews] = useState<{
    session: number;
    total: number;
  }>({ session: 0, total: 0 });
  const [matched, setMatched] = useState<ComputedSignal[]>();
  const [timestamp, setTimestamp] = useState<number>(0);

  const updateState = () => {
    if (context) {
      console.log(`updateState`, context.pageViews.length, context?.t);
      setTimestamp(context.t);
      setPageViews({
        session: context.pageViews.length,
        total: context.state.pageViews,
      });
      setActive({
        audiences: context?.state.audiences?.active || [],
        signals: context?.state.signals?.active || [],
      });
      setMatched(context?.signals?.matched || []);
    }
  };

  useEffect(() => {
    if (!context?.t) {
      updateState();

      const timeoutId = setTimeout(() => {
        console.log(`useEffect timeout`, timestamp, context?.t);
        if (context && timestamp !== context.t) {
          updateState();
        } else console.log(`no context`);
      }, 500);
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, []);

  useEffect(() => {
    if (context?.t) {
      console.log(`useEffect context.t`, context?.t);
      updateState();
    }
  }, [context?.t]);

  if (!context) {
    throw new Error(
      "usePersonalizationContext must be used within a <PersonalizationContext> provider"
    );
  }
  return {
    active,
    matched,
    context,
    pageViews,
    t: timestamp,
  };
};
