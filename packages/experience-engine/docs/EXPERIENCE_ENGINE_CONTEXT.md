# Experience Engine Context

The singleton context object that manages the experience engine features

```typescript
new ExperienceEngineContext(options: ExperienceEngineContextOptions): ExperienceEngineContext;
```

## ExperienceEngineContextOptions

| Option   | Type                                                                                                                | Description                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| client   | [ManifestClient](#manifestclient)                                                                                   | Required configuration for the Manifest Client                                                  |
| debug    | boolean                                                                                                             | Output additional debug information to console and `localStorage`                               |
| handlers | [IHandlers](https://github.com/contensis/experience-engine/blob/main/packages/experience-engine/docs/EVENT_HANDLERS.md) | Add handler(s) to call after the specified event                                                |
| manifest | [IManifest](https://github.com/contensis/experience-engine/blob/main/docs/MANIFEST.md)                                | The Experience Engine Manifest containing the working rules for calculating signals and audiences |
| preview  | boolean                                                                                                             | Are we running the preview Experience Engine Context                                              |

### ManifestClient

| Option    | Type    | Description                                                         |
| --------- | ------- | ------------------------------------------------------------------- |
| alias     | string  | Contensis Cloud alias for the project containing our Audiences      |
| projectId | string  | API ID of the project containing our Audiences (default: `website`) |
| preview   | boolean | `true` requests the latest (unpublished) Manifest                   |
| rootUrl   | string  | Fetch the Manifest from a specific hostname                         |

## ExperienceEngineContext

| Attribute          | Type                                                                                                                                          | Description                                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| addHandler         | [Function](https://github.com/contensis/experience-engine/blob/main/packages/experience-engine/docs/EVENT_HANDLERS.md#addhandler)                 | Add a handler with a callback that will be invoked when the event occurs (dispose handlers with `removeHandler`)                                  |
| audiences          | [CalculateAudiences](#calculateaudiences)                                                                                                     | The audiences last calculated                                                                                                                     |
| compute            | [Function](#compute)                                                                                                                          | Compute (or recompute) the signals and audiences from the current page                                                                            |
| cxpid               | string                                                                                                                                        | Contensis Experience Engine Id                                                                                                                      |
| currentPage        | string                                                                                                                                        | The current page href we are working with                                                                                                         |
| debug              | boolean                                                                                                                                       | Output console.log messaging, `true` or `v`=verbose                                                                                               |
| getAttributes      | [Function](#getattributes)                                                                                                                    | Return any custom attributes provided by the app to the Experience Engine Context                                                                   |
| manifest           | [Manifest](https://github.com/contensis/experience-engine/blob/main/docs/MANIFEST.md)                                                           | The manifest containing the conditions we are using to calculate signals and audiences                                                            |
| overrideAttributes | [Function](#overrideattributes)                                                                                                               | Set signal attributes within the app to override the Experience Engine Context                                                                      |
| pageView           | [Function](#pageview)                                                                                                                         | Register a new page view to compute signals and audiences with                                                                                    |
| pageViews          | [PageView[]](https://github.com/contensis/experience-engine/blob/main/packages/experience-engine/src/models/PageView.d.ts)                        | The page views we have counted and calculated since the Experience Engine Context was last instantiated                                             |
| percentile         | number                                                                                                                                        | Random percentile for experiment bucketing                                                                                                        |
| preview            | boolean                                                                                                                                       | `true` if the context is running in preview mode                                                                                                  |
| previousPage       | string                                                                                                                                        | The previous page href we are working with                                                                                                        |
| removeHandler      | [Function](https://github.com/contensis/experience-engine/blob/main/packages/experience-engine/docs/EVENT_HANDLERS.md#removehandler)              | Dispose any previously added event handlers                                                                                                       |
| reset              | [Function](#reset)                                                                                                                            | Reset some or all experience engine elements                                                                                                        |
| session            | [Session](#session)                                                                                                                           | Holds details pertaining to the current session                                                                                                   |
| setAttributes      | [Function](#setattributes)                                                                                                                    | Supply custom attributes identified within the app to the Experience Engine Context                                                                 |
| signals            | [CalculateSignals](#calculatesignals)                                                                                                         | The signals last calculated                                                                                                                       |
| state              | [IExperienceEngineStore](https://github.com/contensis/experience-engine/blob/main/packages/experience-engine/src/models/ExperienceEngineStore.d.ts) | The experience engine store that is persisted in the browser [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) |
| toggleAudience     | [Function](#toggleaudience)                                                                                                                   | Toggle a specific audience on or off                                                                                                              |

## CalculateAudiences

| Attribute | Type                                    | Description                                            |
| --------- | --------------------------------------- | ------------------------------------------------------ |
| active    | string[]                                | Array of active audience ids                           |
| matched   | [MatchedAudience[]](#matchedaudience)   | Audiences that have been matched in this calculation   |
| computed  | [ComputedAudience[]](#computedaudience) | Audiences that have been processed in this calculation |

### ComputedAudience

```typescript
type ComputedAudience = IAudience & { matched: boolean };
```

### MatchedAudience

```typescript
type MatchedAudience = IAudience & { matched: true };
```

## CalculateSignals

| Attribute  | Type                                                                                                                                   | Description                                                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| matched    | [MatchedSignal[]](#matchedsignal)                                                                                                      | Signals that have been matched in this calculation                                                                           |
| computed   | [ComputedSignal[]](#computedsignal)                                                                                                    | Signals that have been processed in this calculation                                                                         |
| attributes | [ISignalAttributes](https://github.com/contensis/experience-engine/blob/main/packages/experience-engine/src/models/ISignalAttributes.d.ts) | A snapshot of all signal attributes available while this calculation was processed, includes overridden attributes           |
| snapshot   | [ISignalAttributes](https://github.com/contensis/experience-engine/blob/main/packages/experience-engine/src/models/ISignalAttributes.d.ts) | A snapshot of produced signal attributes available while this calculation was processed, not including overridden attributes |

### ComputedSignal

```typescript
type ComputedSignal = ISignal & { times: number; matched: boolean };
```

### MatchedSignal

```typescript
type MatchedSignal = ISignal & { times: number; matched: true };
```

## Session

| Attribute | Type                                            | Description                                                                                                                                           |
| --------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| pvc       | number                                          | The total number of page views in the context                                                                                                         |
| state     | [IExperienceEngineSessionStore](#computedsignal) | The experience engine store that is persisted in the browser [`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) |
| clear     | Function                                        | Clear the session store                                                                                                                               |
| update    | Function                                        | Provide a partial state and update the session store                                                                                                  |

## setAttributes

Supply one or more custom attributes and then perform signal and audience calculations

```typescript
setAttributes({
    [attributeId: string]: string | number | boolean
}): void;
```

## overrideAttributes

Permanently set a value for the given attribute(s). The overridden value will be used in all subsequent signal and audience calculations, or until the experience engine attributes are reset.

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

## compute

Compute (or recompute) the signals and audiences from the current page

You should not need to call this as it is called automatically when an action has been performed or detected that requires signals and audiences to be computed again

```typescript
compute(pageView?: PageView): void;
```

## pageView

Register a new page view to compute signals and audiences with

You should not need to call this as we watch for changes being made to the DOM tree using a [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) and automatically detect navigation (in a SPA) via changes to the URL

```typescript
pageView(url?: string): void;
```

## reset

Resets some or all experience engine elements

[Reset examples](https://github.com/contensis/experience-engine/tree/main/packages/react#reset-personalization)

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
