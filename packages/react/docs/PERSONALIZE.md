# Personalize component

```typescript
Personalize<
  Variant extends Record<string, unknown> &
    Record<AudienceKey, string | string[]>,
  AudienceKey extends string = "audiences"
>(props: {
  variants: Variant[];
  defaultContent?: Variant;
  audienceKey?: AudienceKey;
  render?: React.ComponentType<Variant>;
  children?: React.ComponentType<Variant>;
}): React.JSX.Element | null;
```

## Props

| Prop           | Type      | Description                                                                                                              |
| -------------- | --------- | ------------------------------------------------------------------------------------------------------------------------ |
| audienceKey    | string    | Field ID containing the `audience(s)` in each personalized variant (omit if field is called `audiences`)             |
| defaultContent | Component | The default variant to render when the current visitor is not currently a member of any audience in the `variants` array |
| render         | Component | The React component (or function returning the JSX) to render with props for one variant. Same as adding JSX `children`. |
| variants       | Variant[] | An array of personalized content variants, each personalized variant must contain at least one audience.                 |
