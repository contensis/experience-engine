# usePersonalizationContext hook

Calling the usePersonalizationContext hook requires no arguments, but does require our root component to be wrapped in a [`PersonalizationProvider`](./PERSONALIZATION_PROVIDER.md)

An [IPersonalizationReactContext](https://github.com/contensis/personalization/blob/main/packages/react/src/context/PersonalizationReactContext.tsx) object will be returned that can be destructured to use any of the following attributes

```typescript
usePersonalizationContext(): IPersonalizationReactContext;
```

### Returns

| Property           | Type                                                                                                                                          | Description                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| context            | PersonalizationContext                                                                                                                        | Singleton context object that manages the personalization features                             |
| isAudience         | [Function](#isaudience)                                                                                                                       | Returns true if the visitor is a member of any provided audience id                            |
| audiences          | string[]                                                                                                                                      | Array of audience ids the visitor is a member of                                               |
| signals            | string[]                                                                                                                                      | Array of signal ids the visitor has activated                                                  |
| matched            | [ComputedSignal[]](https://github.com/contensis/personalization/blob/main/packages/personalization/src/models/Signals.d.ts)                   | Signals the vistor has matched in this page view                                               |
| computed           | [ComputedSignal[]](https://github.com/contensis/personalization/blob/main/packages/personalization/src/models/Signals.d.ts)                   | Array of computed signals from the last time signals were computed                             |
| manifest           | [Manifest](https://github.com/contensis/personalization/blob/main/packages/personalization/src/models/api/Manifest.d.ts)                      | The manifest containing the conditions we are using to calculate signals and audiences         |
| pageViews.session  | number                                                                                                                                        | Number of page views accumulated in the current browser session                                |
| pageViews.total    | number                                                                                                                                        | Total number of page views (recorded in localStorage)                                          |
| percentile         | number                                                                                                                                        | The random percentile the current visitor is placed in to 2 decimal places (resolution: 10000) |
| state              | [IPersonalizationStore](https://github.com/contensis/personalization/blob/main/packages/personalization/src/models/PersonalizationStore.d.ts) | The personalization store that is persisted in the browser localStorage                        |
| setAttributes      | [Function](#setattributes)                                                                                                                    | Supply custom attributes identified within the app to the personalization context              |
| overrideAttributes | [Function](#overrideattributes)                                                                                                               | Set signal attributes within the app to override the personalization context                   |
| getAttributes      | [Function](#getattributes)                                                                                                                    | Return any custom attributes provided by the app to the personalization context                |
| toggleAudience     | [Function](#toggleaudience)                                                                                                                   | Toggle a specific audience on or off                                                           |

## isAudience

Test if the visitor has activated any provided audience id(s)

```typescript
isAudience(audienceId: string): boolean;

isAudience(audienceIds: string[]): boolean;
```

## setAttributes

Supply one or more custom attributes and then perform signal and audience calculations

```typescript
setAttributes({
    [attributeId: string]: string | number | boolean
}): void;
```

## overrideAttributes

Permanently set a value for the given attribute(s). The overridden value will be used in all subsequent signal and audience calculations, or until the personalization attributes are reset.

```typescript
overrideAttributes({
    [attribute: string]: string | number | boolean
}): void;
```

## getAttributes

Return the value for the provided attribute key

```typescript
getAttributes(attribute: string): string | number | boolean;
```

Provide an array of attribute keys to return just those attributes

```typescript
getAttributes(attributes: string[]): {
    [attribute: string]: string | number | boolean
};
```

Return all available attributes from the current attributes snapshot

```typescript
getAttributes(): {
    [attribute: string]: string | number | boolean
};
```

## toggleAudience

Toggle a specific audience on or off for use when debugging sites in preview

```typescript
toggleAudience(audienceId: string): void;
```
