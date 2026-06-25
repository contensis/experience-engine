# useExperienceEngineContext hook

Calling the useExperienceEngineContext hook requires no arguments, but does require our root component to be wrapped in a [`ExperienceEngineProvider`](./EXPERIENCE_ENGINE_PROVIDER.md)

An [IExperienceEngineReactContext](https://github.com/contensis/experience-engine/blob/main/packages/react/src/context/ExperienceEngineReactContext.tsx) object will be returned that can be destructured to use any of the following attributes

```typescript
useExperienceEngineContext(): IExperienceEngineReactContext;
```

### Returns

| Property           | Type                                                                                                                                          | Description                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| context            | ExperienceEngineContext                                                                                                                        | Singleton context object that manages the experience engine features                             |
| isAudience         | [Function](#isaudience)                                                                                                                       | Returns true if the visitor is a member of any provided audience id                            |
| audiences          | string[]                                                                                                                                      | Array of audience ids the visitor is a member of                                               |
| signals            | string[]                                                                                                                                      | Array of signal ids the visitor has activated                                                  |
| matched            | [ComputedSignal[]](https://github.com/contensis/experience-engine/blob/main/packages/experience-engine/src/models/Signals.d.ts)                   | Signals the vistor has matched in this page view                                               |
| computed           | [ComputedSignal[]](https://github.com/contensis/experience-engine/blob/main/packages/experience-engine/src/models/Signals.d.ts)                   | Array of computed signals from the last time signals were computed                             |
| manifest           | [Manifest](https://github.com/contensis/experience-engine/blob/main/packages/experience-engine/src/models/api/Manifest.d.ts)                      | The manifest containing the conditions we are using to calculate signals and audiences         |
| pageViews.session  | number                                                                                                                                        | Number of page views accumulated in the current browser session                                |
| pageViews.total    | number                                                                                                                                        | Total number of page views (recorded in localStorage)                                          |
| percentile         | number                                                                                                                                        | The random percentile the current visitor is placed in to 2 decimal places (resolution: 10000) |
| state              | [IExperienceEngineStore](https://github.com/contensis/experience-engine/blob/main/packages/experience-engine/src/models/ExperienceEngineStore.d.ts) | The experience engine store that is persisted in the browser localStorage                        |
| setAttributes      | [Function](https://github.com/contensis/experience-engine/blob/main/packages/experience-engine/docs/EXPERIENCE_ENGINE_CONTEXT.md#setattributes)                                                                                                                    | Supply custom attributes identified within the app to the experience engine context              |
| overrideAttributes | [Function](https://github.com/contensis/experience-engine/blob/main/packages/experience-engine/docs/EXPERIENCE_ENGINE_CONTEXT.md#overrideattributes)                                                                                                               | Set signal attributes within the app to override the experience engine context                   |
| getAttributes      | [Function](https://github.com/contensis/experience-engine/blob/main/packages/experience-engine/docs/EXPERIENCE_ENGINE_CONTEXT.md#getattributes)                                                                                                                    | Return any custom attributes provided by the app to the experience engine context                |
| toggleAudience     | [Function](https://github.com/contensis/experience-engine/blob/main/packages/experience-engine/docs/EXPERIENCE_ENGINE_CONTEXT.md#toggleaudience)                                                                                                                   | Toggle a specific audience on or off                                                           |

## isAudience

Test if the visitor has activated any provided audience id(s)

```typescript
isAudience(audienceId: string): boolean;

isAudience(audienceIds: string[]): boolean;
```