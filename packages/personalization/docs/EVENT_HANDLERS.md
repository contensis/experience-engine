# Event Handlers

A custom event handler can be added to the PersonalizationContext in a few ways

1. call the [`context.addHandler(...)`](#addhandler) function any time after the context has initialized
2. via the [Personalization Context](https://github.com/contensis/personalization/blob/main/packages/personalization/docs/PERSONALIZATION_CONTEXT.md) constructor options
3. or in the React package, via the [Personalization Provider](https://github.com/contensis/personalization/blob/main/packages/react/docs/PERSONALIZATION_PROVIDER.md) props and will be available to the Personalization Context from the time it is created.

| Handler         | Type                         | Description                                                                  |
| --------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| onComputed      | [Function](#oncomputed)      | called each time signals and audiences are computed                          |
| onInit          | [Function](#oninit)          | called one time when the Personalization Context is initialized              |
| onManifestReady | [Function](#onmanifestready) | called each time a manifest has been loaded                                  |
| onNavigate      | [Function](#onnavigate)      | called each time the Personalization Context detects navigation within a SPA |
| onPageView      | [Function](#onpageview)      | called each time the Personalization Context has registered a Page View      |

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
onInit(context: PersonalizationContext): void;
```

### onManifestReady

```typescript
onManifestReady(
    context: PersonalizationContext,
    manifest: IManifest
): void;
```

### onNavigate

```typescript
onNavigate(
    context: PersonalizationContext,
    current: string,
    previous?: string
): void;
```

### onPageView

```typescript
onPageView(
    context: PersonalizationContext,
    current: string,
    previous?: string
): void;
```

### onComputed

```typescript
onComputed(context: PersonalizationContext): void;
```
