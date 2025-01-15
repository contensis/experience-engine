import React, { useEffect, useState } from "react";
import { usePersonalizationContext } from "../hooks/usePersonalizationContext";

const DEFAULT_SPLIT_KEY = "split";

type ExperimentSplitKey = typeof DEFAULT_SPLIT_KEY;

type ExperimentBase<T extends string = ExperimentSplitKey> = {
  [splitKey in T]: number | string;
};

export type ExperimentProps<
  T extends ExperimentBase<K>,
  K extends string = ExperimentSplitKey
> = {
  /**
   * Array of content variants.
   * - Each variant must include a field that contains a number to split the test cases by
   * - Set the `splitKey` prop if this field is not called `split`
   */
  experiments: T[];
  /** The content field id to look for that contains the relational split for every variant, defaults to: `split`  */
  splitKey?: K;
  /** The component to render with the variant/default content */
  render?: React.ComponentType<Omit<T, K>>;
  children?: React.ComponentType<Omit<T, K>>;
};

export const Experiment = <
  TVariant extends ExperimentBase<KExperimentSplit>,
  KExperimentSplit extends string = ExperimentSplitKey
>(
  props: ExperimentProps<TVariant, KExperimentSplit>
) => {
  // Component can be passed in a render prop or as children
  const Component =
    "children" in props
      ? props.children
      : "render" in props
      ? props.render
      : null;

  const { percentile } = usePersonalizationContext();

  // Determine the key in each variant that holds the audiences
  const [split] = useState(
    props.splitKey || (DEFAULT_SPLIT_KEY as KExperimentSplit)
  );
  const [sorted] = useState(
    props.experiments.sort((e) => Number(e[split])).reverse()
  );
  const [variant, setVariant] = useState(sorted.find((e) => !e[split]));

  useEffect(() => {
    for (const experiment of sorted) {
      if (percentile >= Number(experiment[split])) {
        setVariant(experiment);
        break;
      }
    }
  }, [percentile, sorted, split]);

  if (Component && variant) {
    return <Component {...variant} />;
  }
  return null;
};
