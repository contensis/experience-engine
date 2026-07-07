# Event Handlers

A custom event handler can be added to the ExperienceEngineContext in a few ways

1. call the [`context.addHandler(...)`](#addhandler) function any time after the context has initialized
2. via the [Experience Engine Context](https://github.com/contensis/experience-engine/blob/main/packages/experience-engine/docs/EXPERIENCE_ENGINE_CONTEXT.md) constructor options
3. or in the React package, via the [Experience Engine Provider](https://github.com/contensis/experience-engine/blob/main/packages/react/docs/PERSONALIZATION_PROVIDER.md) props and will be available to the Experience Engine Context from the time it is created.

| Handler         | Type                         | Description                                                                  |
| --------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| onComputed      | [Function](#oncomputed)      | called each time signals and audiences are computed                          |
| onInit          | [Function](#oninit)          | called one time when the Experience Engine Context is initialized              |
| onManifestReady | [Function](#onmanifestready) | called each time a manifest has been loaded                                  |
| onNavigate      | [Function](#onnavigate)      | called each time the Experience Engine Context detects navigation within a SPA |
| onPageView      | [Function](#onpageview)      | called each time the Experience Engine Context has registered a Page View      |

## addHandler

Add a handler with a callback that will be invoked when the event occurs (dispose handlers with `removeHandler`)

```typescript
addHandler("onComputed", IHandler["onComputed"]): void;
```

## removeHandler

Dispose any previously added event handlers

```typescript
removeHandler("onComputed", IHandler["onComputed"]): void;
```

## Events (`IHandler`)

### onInit

```typescript
onInit(context: ExperienceEngineContext): void;
```

### onManifestReady

```typescript
onManifestReady(
    context: ExperienceEngineContext,
    manifest: IManifest
): void;
```

### onNavigate

```typescript
onNavigate(
    context: ExperienceEngineContext,
    current: string,
    previous?: string
): void;
```

### onPageView

```typescript
onPageView(
    context: ExperienceEngineContext,
    current: string,
    previous?: string
): void;
```

### onComputed

```typescript
onComputed(context: ExperienceEngineContext): void;
```
