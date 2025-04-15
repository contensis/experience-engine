# Personalization Context

```typescript
new PersonalizationContext(options: PersonalizationContextOptions);
```

## PersonalizationContextOptions

| Option   | Type                                                                                                                | Description                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| client   | [ManifestClient](#manifestclient)                                                                                   | Required configuration for the Manifest Client                                                  |
| debug    | boolean                                                                                                             | Output additional debug information to console and localStorage                                 |
| handlers | [IHandlers](https://github.com/contensis/personalization/blob/main/packages/personalization/docs/EVENT_HANDLERS.md) | Add handler(s) to call after the specified event                                                |
| manifest | [IManifest](https://github.com/contensis/personalization/blob/main/docs/MANIFEST.md)                                | The Personalization Manifest containing the working rules for calculating signals and audiences |
| preview  | boolean                                                                                                             | Are we running the preview Personalization Context                                              |

### ManifestClient

```typescript
 ManifestClient(
  alias: string,
  projectId: string,
  preview?: boolean,
  rootUrl?: string
);
```

| Option    | Type    | Description                                                         |
| --------- | ------- | ------------------------------------------------------------------- |
| alias     | string  | Contensis Cloud alias for the project containing our Audiences      |
| projectId | string  | API ID of the project containing our Audiences (default: `website`) |
| preview   | boolean | Set `true` to request the latest (unpublished) Manifest             |
| rootUrl   | string  | Fetch the Manifest from a specific hostname                         |

## PersonalizationContext

| Option             | Type                                                                                                                                           | Description                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| addHandler         | [Function](https://github.com/contensis/personalization/blob/main/packages/personalization/docs/PERSONALIZATION_CONTEXT.md#addhandler)         | Add a handler with a callback that will be invoked when the event occurs                             |
| audiences          | [CalculateAudiences]                                                                                                                           | The audiences last calculated                                                                        |
| compute            | [Function]                                                                                                                                     | Compute (or recompute) the signals and audiences from the current page                               |
| cpid               | string                                                                                                                                         | Contensis Personalization Id                                                                         |
| currentPage        | string                                                                                                                                         | The current page href we are working with                                                            |
| debug              | boolean                                                                                                                                        | Output console.log messaging, `true` or `v`=verbose                                                  |
| getAttributes      | [Function](https://github.com/contensis/personalization/blob/main/packages/personalization/docs/PERSONALIZATION_CONTEXT.md#getattributes)      | Return any custom attributes provided by the app to the personalization context                      |
| manifest           | [Manifest](https://github.com/contensis/personalization/blob/main/docs/MANIFEST.md)                                                            | The manifest containing the conditions we are using to calculate signals and audiences               |
| overrideAttributes | [Function](https://github.com/contensis/personalization/blob/main/packages/personalization/docs/PERSONALIZATION_CONTEXT.md#overrideattributes) | Set signal attributes within the app to override the personalization context                         |
| pageView           | [Function]                                                                                                                                     | Register a new page view to compute signals and audiences with                                       |
| pageViews          | PageView[]                                                                                                                                     | The pageViews we have counted and calculated since the Personalization Context was last instantiated |
| percentile         | number                                                                                                                                         | Random percentile for experiment bucketing                                                           |
| preview            | boolean                                                                                                                                        | `true` if the context is running in preview mode                                                     |
| previousPage       | string                                                                                                                                         | The previous page href we are working with                                                           |
| removeHandler      | [Function](https://github.com/contensis/personalization/blob/main/packages/personalization/docs/PERSONALIZATION_CONTEXT.md#removehandler)      | Clean up any handlers previously added                                                               |
| reset              | [Function](#reset)                                                                                                                             | Reset some or all personalization elements                                                           |
| session            | [Session]                                                                                                                                      | Holds details pertaining to the current session                                                      |
| setAttributes      | [Function](https://github.com/contensis/personalization/blob/main/packages/personalization/docs/PERSONALIZATION_CONTEXT.md#setattributes)      | Supply custom attributes identified within the app to the personalization context                    |
| signals            | [CalculateSignals]                                                                                                                             | The signals last calculated                                                                          |
| state              | [IPersonalizationStore](https://github.com/contensis/personalization/blob/main/packages/personalization/src/models/PersonalizationStore.d.ts)  | The personalization store that is persisted in the browser localStorage                              |
| toggleAudience     | [Function](https://github.com/contensis/personalization/blob/main/packages/personalization/docs/PERSONALIZATION_CONTEXT.md#toggleaudience)     | Toggle a specific audience on or off                                                                 |

## reset

Reset some or all personalization elements

```typescript
reset(): void;

reset({
    audiences?: boolean;
    signals?: boolean;
    attributes?: boolean;
    manifest?: boolean;
    session?: boolean;
    store?: boolean;
}): void;
```

[Examples](https://github.com/contensis/personalization/tree/main/packages/react#reset-personalization)

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
