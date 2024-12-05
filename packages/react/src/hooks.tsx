import { useContext, useEffect, useState } from "react";
import { PersonalizationReactContext } from "./context";

export const usePersonalizationContext = () => {
  const context = useContext(PersonalizationReactContext);

  const [audiences, setAudiences] = useState<string[]>(
    context?.state.audiences?.active || []
  );

  useEffect(() => {
    setAudiences(context?.state.audiences?.active || []);
  }, []);

  if (!context) {
    throw new Error(
      "usePersonalizationContext must be used within a <PersonalizationContext> provider"
    );
  }
  return { audiences, context };
};
