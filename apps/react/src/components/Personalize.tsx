import { usePersonalizationContext } from "@contensis/personalization-react";
import { useEffect, useState } from "react";

const DEFAULT_AUDIENCE_KEY = "audiences";

type AudienceKey = typeof DEFAULT_AUDIENCE_KEY;

type PersonalizeBase<T extends string = AudienceKey> = {
  [audienceKey in T]: string | string[];
};

type PersonalizeProps<
  T extends PersonalizeBase<K>,
  K extends string = AudienceKey
> = {
  /**
   * Array of content variants.
   * - Each variant must include a field that contains audience ids
   * - Set the `audienceKey` prop if this field is not called `audiences`
   */
  variants: T[];
  /** Set the content to render if we haven't matched a personalized variant  */
  defaultContent?: Omit<T, K>;
  /** The content field id to look for that contains audience ids in every variant, defaults to: `audiences`  */
  audienceKey?: K;
  children?: React.ComponentType<Omit<T, K>>;
  /** The component to render with the variant/default content */
  render?: React.ComponentType<Omit<T, K>>;
};

const Personalize = <
  TVariant extends PersonalizeBase<KAudienceKey>,
  KAudienceKey extends string = AudienceKey
>(
  props: PersonalizeProps<TVariant, KAudienceKey>
) => {
  // Component can be passed in a render prop or as children
  const Component =
    "children" in props
      ? props.children
      : "render" in props
      ? props.render
      : null;

  // Get the isAudience helper function from personalization context
  const { isAudience } = usePersonalizationContext();

  // Determine the key in each variant that holds the audiences
  const [audiences] = useState(
    props.audienceKey || (DEFAULT_AUDIENCE_KEY as KAudienceKey)
  );

  // Set the defaultContent to be either defaultContent prop
  // or a variant that has no audiences set
  const [defaultContent] = useState(
    props.defaultContent ||
      props.variants?.find(
        (variant) =>
          (audiences in variant && !variant[audiences]) ||
          (Array.isArray(variant[audiences]) && !variant[audiences].length)
      ) ||
      null
  );

  // Keep the content variants in component state
  const [contentVariants] = useState(props.variants);

  // Maintain state to set personalized variant
  // Initial value is the default content (also rendered in SSR)
  const [personalizedVariant, setPersonalizedVariant] =
    useState<typeof defaultContent>(null);

  // Monitor changes to isAudience context prop and fire
  // the effect to set a personalized variant if our visitor
  // has activated any of the audiences in each content variant
  useEffect(() => {
    let personalized = false;
    for (const variant of contentVariants) {
      if (isAudience(variant[audiences])) {
        setPersonalizedVariant(variant);
        personalized = true;
        break;
      }
    }
    if (!personalized) setPersonalizedVariant(defaultContent);
  }, [audiences, contentVariants, defaultContent, isAudience]);

  // Render the component with any variant
  if (Component && personalizedVariant) {
    return <Component {...personalizedVariant} />;
  }

  // If we dont have a component to render, or any variant, render null
  return null;
};

export default Personalize;
