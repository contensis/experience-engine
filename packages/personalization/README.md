# [![Contensis](https://github.com/contensis/cli/raw/refs/heads/main/assets/contensis-logo--tiny.svg)](https://www.contensis.com) @contensis/personalization [![NPM version](https://img.shields.io/npm/v/@contensis/personalization.svg?style=flat)](https://www.npmjs.com/package/@contensis/personalization)

[![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Create a Personalization Context to easily leverage personalization with Contensis in your JavaScript site.

If your project is built with React it is recommended you use the [@contensis/personalization-react](../react/README.md) package instead

### Prerequisites

Before we can see Personalization in action it is recommended we first [ensure content is Personalized for different audiences](https://github.com/contensis/personalization/blob/main/docs/PERSONALIZE_CONTENT.md)

Familiarise yourself with the terminology by looking at [how we determine audiences](https://github.com/contensis/personalization/blob/main/README.md#how-it-works) in order to personalize content

## Installation

```bash
npm install --save @contensis/personalization
```

```bash
yarn add --save @contensis/personalization
```

## Configuration

Two bundles are available for use:

- `dist/personalization.min.(m)js`
  <br>exports the core [PersonalizationContext](https://github.com/contensis/personalization/blob/main/packages/personalization/docs/PERSONALIZATION_CONTEXT.md) class to instantiate yourself
- `dist/personalization.browser.min.(m)js`
  <br>browser-specific bundle instantiates the [PersonalizationContext](https://github.com/contensis/personalization/blob/main/packages/personalization/docs/PERSONALIZATION_CONTEXT.md) with `data` attributes in the `<script>` tag

## Browser bundle

Initialise a `<script>` tag and set the `src` attribute

- set `type="module"` and load the ES module `dist/personalization.browser.min.mjs`
- or, load the common js script `dist/personalization.browser.min.js`

You may wish to move these scripts to a place pertinent to your hosting requirement or reference the script directly from a public CDN such as [unpkg](https://unpkg.com/)

For example

```html
<script
  type="module"
  src="https://unpkg.com/@contensis/personalization@latest/dist/personalization.browser.min.mjs"
></script>
```

### Script attributes

Set `data` attributes in the above `<script>` tag to configure the Personalization Context.

Each attribute must be prefixed with `data-contensis-personalization-`.

For example, to set `alias` attribute it must be added to the `<script>` tag like this

```
<script data-contensis-personalization-alias="example" ...>
```

| Attribute  | Type    | Description                                                    |
| ---------- | ------- | -------------------------------------------------------------- |
| alias      | string  | Contensis Cloud alias for the project containing our Audiences |
| project-id | string  | API ID of the project containing our Audiences                 |
| preview    | boolean | Set `true` to request the latest (unpublished) Manifest        |
| root-url   | string  | Fetch the Manifest from a specific hostname                    |
| debug      | boolean | Set `true` to enable console logging                           |

### Global attributes

Some attributes can be pre-set in the `global` / `window` context, this approach can ensure these attributes are set _before_ the Personalization Context is initialized.

```javascript
// Output console logs and extra info
window.CONTENSIS_PERSONALIZATION.debug = true;

// Use a manifest provided by the app
window.CONTENSIS_PERSONALIZATION.manifest = json;
```

| Attribute       | Type                                                                                                                               | Description                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| manifest        | [Manifest](https://github.com/contensis/personalization/blob/main/docs/MANIFEST.md)                                                | The complete Manifest to use in this personalization context. Used instead of `alias` and `projectId` |
| debug           | boolean                                                                                                                            | Set `true` to enable console logging                                                                  |
| onComputed      | [Function](https://github.com/contensis/personalization/blob/main/packages/personalization/docs/EVENT_HANDLERS.md#oncomputed)      | Custom handler called each time signals and audiences are computed                                    |
| onInit          | [Function](https://github.com/contensis/personalization/blob/main/packages/personalization/docs/EVENT_HANDLERS.md#oninit)          | Custom handler called one time when the Personalization Context is initialized                        |
| onManifestReady | [Function](https://github.com/contensis/personalization/blob/main/packages/personalization/docs/EVENT_HANDLERS.md#onmanifestready) | Custom handler called each time a manifest has been loaded                                            |
| onNavigate      | [Function](https://github.com/contensis/personalization/blob/main/packages/personalization/docs/EVENT_HANDLERS.md#onnavigate)      | Custom handler called each time the Personalization Context detects navigation within a SPA           |
| onPageView      | [Function](https://github.com/contensis/personalization/blob/main/packages/personalization/docs/EVENT_HANDLERS.md#onpageview)      | Custom handler called each time the Personalization Context has registered a Page View                |

## Personalize content

All functions require a handle on and are called from within the [Personalization Context](https://github.com/contensis/personalization/blob/main/packages/personalization/docs/PERSONALIZATION_CONTEXT.md)

### Active audiences

```typescript
const audiences: string[] = context.audiences.active;
```

#### Example find a personalized audience variant

```typescript
const variants = [
  {
    audience: "exampleAudience",
    text: "Render example personalized content",
  },
  {
    audience: "testAudience",
    text: "Render variant personalized for test audience",
  },
];

const personalizedVariant = variants.find((variant) =>
  context.audiences.active.includes(variant.audience)
);
```

#### Example variants including a default variant

```typescript
const variants = [
  { audience: "", text: "Render default text" },
  {
    audience: "testAudience",
    text: "Render variant personalized for test audience",
  },
];

const audiences: string[] = context.audiences.active;

const defaultVariant = variants.find((variant) => variant.audience === "");

const personalizedVariant = variants.find((variant) =>
  audiences.includes(variant.audience)
);

const render = personalizedVariant || defaultVariant;
```

### Active signals

```typescript
const signals: string[] = context.signals.active;
```

## Custom Attributes

Custom attributes are configured in Contensis and can become part of the conditions to activate a signal

They allow developers to supply values produced within the app or provided by visitor actions for consideration when calculating signal and audience conditions

### [setAttributes](https://github.com/contensis/personalization/blob/main/packages/personalization/docs/PERSONALIZATION_CONTEXT.md#setattributes)

Supply one or more custom attributes and then perform signal and audience calculations

```html
<html>
  <head>
    <script>
      /** Set custom attribute `searchQuery` */
      const handleSearchSubmit = () => {
        const { context } = CONTENSIS_PERSONALIZATION;
        const value = document.getElementById("searchInput").value;
        /** We can call `setAttributes` any time we have captured
         *  the value(s) to use for the custom attribute(s) */
        context.setAttributes({
          searchQuery: value,
        });
      };

      window.onload = function () {
        const { context } = CONTENSIS_PERSONALIZATION;
        /** Add search submit handlers to elements **/
        document
          .getElementById("searchInput")
          .addEventListener("keydown", (e) => {
            // Submit on Enter key
            if (e.key === "Enter") handleSearchSubmit();
          });
        document
          .getElementById("searchSubmit")
          .addEventListener("click", () => {
            handleSearchSubmit();
          });
      };
    </script>
  </head>
  <body>
    <div>
      <input id="searchInput" type="text" placeholder="Search" />
      <button id="searchSubmit">Search</button>
    </div>
  </body>
</html>
```

Attributes we have set will be calculated one time only

If our Manifest contains a signal that requires the above `custom.searchQuery` to match before it is activated, we can match and activate signals containing this condition at the time the search is performed and the value for the attribute has been set.

The attribute values are not stored and cannot be considered as a "previous" searchQuery in subsequent navigations or actions

### [overrideAttributes](https://github.com/contensis/personalization/blob/main/packages/personalization/docs/PERSONALIZATION_CONTEXT.md#overrideattributes)

Permanently set a value for the given attribute(s). The overridden value will be used in all subsequent signal and audience calculations, or until the personalization attributes are reset.

`overrideAttributes` can permanently set/override any of the signal attributes including built-in attributes. It may be useful to override a specific attribute with a specific value when debugging certain scenarios.

Following on from the previous example, if we wanted to hold and maintain the last input searchQuery, and consider this value in every signal and audience calculation going forward. We can use `overrideAttributes` instead.

`overrideAttributes` requires the fully qualified attribute key, exactly as would appear in the Manifest. For example `custom.searchQuery` or `page.domain`

```javascript
/** Set custom attributes `searchQuery`, `lastSearchQuery` and `totalSearches` */
const handleSearchSubmit = () => {
  const { context } = CONTENSIS_PERSONALIZATION;
  const value = document.getElementById("searchInput").value;
  /** We can call `setAttributes` any time we have captured
   *  the value(s) to use for the custom attribute(s) */
  context.setAttributes({
    searchQuery: value,
  });

  /** We can call `overrideAttributes` any time we wish
   *  to hold and maintain an attribute over time */
  context.overrideAttributes({
    "custom.lastSearchQuery": value,
    /** We could maintain a counter of previous interactions
     *  Recall a previously set attribute with `getAttributes` and increment */
    "custom.totalSearches":
      1 + (context.getAttributes("custom.totalSearches") || 0),
  });
};
```

[Complete example](https://github.com/contensis/personalization/blob/main/apps/html/custom-attributes.html)

## Experiments

When running experiments (or A/B testing), similar to handling the personalized data, an experiment will render one of a number of supplied content variants.

Except we are not rendering personalized content based on active audiences, instead each variant (experiment) contains a number field between 0 and 100 that constitutes where the experiment variants are "split" between each randomly assigned "bucket".

### Prerequisites

- [Curating content for experiments](https://github.com/contensis/personalization/blob/main/docs/EXPERIMENT_CONTENT.md)

### Example

```html
<html>
  <head>
    <script>
      /** data: Hard-coded example entry for the demo */
      const entry = {
        lead: "Personalization in Contensis",
        experiments: [
          {
            split: 0,
            lead: "This content will be rendered for visitors randomly placed in the lower 10%",
          },
          {
            split: 10,
            lead: "This content will be rendered for visitors in the 10-50 percentile range",
          },
          {
            split: 50,
            lead: "This content will be rendered for visitors randomly placed in the top 50%",
          },
        ],
      };

      /** boilerplate: Pick from one of the experiments based on the
       * random bucket the visitor has been placed into */
      const pickExperiment = (experiments) => {
        // Sort the variants by the value of the "split" field
        // in descending order
        const variants = experiments.toSorted((e) => Number(e.split)).reverse();

        // Find the first variant in the sorted array that has a split
        // value less than the random percentile
        const experiment = variants.find(
          (e) => CONTENSIS_PERSONALIZATION.context.percentile >= Number(e.split)
        );

        // Return an experiment for the visitor bucket
        // or find a default variant
        return experiment || variants.find((e) => !e.split);
      };

      window.onload = function () {
        /** Render the entry data to elements */
        document.getElementById("title").innerHTML = entry.lead;
        document.getElementById("lead").innerHTML = pickExperiment(
          entry.experiments
        )?.lead;
      };
    </script>
  </head>
  <body>
    <div>
      <h1 id="title"></h1>
      <p id="lead"></p>
    </div>
  </body>
</html>
```

[Complete example](https://github.com/contensis/personalization/blob/main/apps/html/experiment-content.html)

## Debugging

### Debug flag

Output trace information in console logs showing actions performed by the Personalization Context

Set the `debug` property in the `PersonalizationContext` to `true` to output trace logs. Use `"v"` for verbose logging.

### Use the Latest Manifest (unpublished / preview)

To test changes made to audiences and signals in Contensis prior to them being published, we can request the latest manifest version (instead of the default published version)

1. Set the `preview` property in the `PersonalizationContext` to `true`
2. If the `preview` property is updated after the `PersonalizationContext` has instantiated, also `reset` the manifest in the Personalization Context

### Browser Window object reference

The personalization context can be examined or watched in the Console of the browser developer tools at any time from the browser's global scope

Type `window.CONTENSIS_PERSONALIZATION.context` into the browser developer tools Console window

### Reset personalization

Manually reset personalization by deleting `localStorage` and `sessionStorage` in the browser developer tools for the current host.

Alternatively, we can manually reset personalization by running the `reset()` function in the browser console using [the window object reference](#browser-window-object-reference):

```javascript
window.CONTENSIS_PERSONALIZATION.context.reset();
```

Or we can reset some or all personalization elements programatically

```javascript
import React from "react";
import { usePersonalizationContext } from "@contensis/personalization-react";

const ExampleComponent = () => {
  // First get a handle on the `context` object
  const { context } = usePersonalizationContext();

  // examples are below
  return <div>...</div>;
};
```

#### Reset all personalizations

```javascript
context.reset();
```

#### Reset the Manifest

Set the `preview` flag and then reset the manifest to load the latest (unpublished) manifest version

```javascript
// Update the preview flag in the context
context.preview = true;

// Reset the personalization manifest
context.reset({ manifest: true });
```

#### Reset all Audiences / Signals

```javascript
context.reset({
  audiences: true,
  // It makes sense to also reset signals
  // at the same time so we can avoid
  // immediately reactivating any audiences
  // via previously matched signals
  signals: true,
});
```

#### Reset all Attributes

Clears all custom and overridden attributes

```javascript
context.reset({
  attributes: true,
});
```

## License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC). For detailed terms, please refer to the license file included in this repository.

### Attribution

This project makes use of the following dependencies and data sources, which are governed by separate licenses:

#### 1. [`caniuse-lite`](https://github.com/browserslist/caniuse-lite)

The project indirectly utilizes data from `caniuse-lite` as part of its build tooling. The data, sourced from [caniuse.com](https://caniuse.com), is made available under the **Creative Commons Attribution 4.0 International [(CC BY 4.0)](http://creativecommons.org/licenses/by/4.0/)** license. For more information, visit [the repository](https://github.com/browserslist/caniuse-lite#license).

#### 2. [`spdx-exceptions`](https://github.com/kemitchell/spdx-exceptions.json#readme)

This project indirectly references the `spdx-exceptions` package as part of its build tooling. Portions of the data used are derived from version 2.0 of the SPDX specification, licensed under the **Creative Commons Attribution 3.0 Unported [(CC-BY-3.0)](http://creativecommons.org/licenses/by/3.0/)** license. For details, see [the repository](https://github.com/kemitchell/spdx-exceptions.json#readme).

---
