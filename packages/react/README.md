# [![Contensis](https://github.com/contensis/cli/raw/refs/heads/main/assets/contensis-logo--tiny.svg)](https://www.contensis.com) @contensis/experience-engine-react [![NPM version](https://img.shields.io/npm/v/@contensis/experience-engine-react.svg?style=flat)](https://www.npmjs.com/package/@contensis/experience-engine-react)

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Provides a context wrapper, hooks and components to easily leverage experience engine with Contensis in your React projects

### Prerequisites

Before we can see the Experience Engine in action it is recommended we first [ensure content is personalized for different audiences](https://github.com/contensis/experience-engine/blob/main/docs/PERSONALIZE_CONTENT.md)

Familiarise yourself with the terminology by looking at [how we determine audiences](https://github.com/contensis/experience-engine/blob/main/README.md#how-it-works) in order to personalize content

## Installation

```bash
npm install --save @contensis/experience-engine-react
```

```bash
yarn add --save @contensis/experience-engine-react
```

## Configuration

### [\<ExperienceEngineProvider \/\> component](https://github.com/contensis/experience-engine/blob/main/packages/react/docs/EXPERIENCE_ENGINE_PROVIDER.md)

Wrap your "`App`" root component with a `ExperienceEngineProvider`

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ExperienceEngineProvider } from "@contensis/experience-engine-react";

import { MainLayout } from "./App";

// Our React App
const App = () => {
  return (
    <div className="content">
      <ExperienceEngineProvider alias="example" projectId="website">
        <MainLayout />
      </ExperienceEngineProvider>
    </div>
  );
};


// Render the App
createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

## Personalize content variations

### [\<Personalize \/\> component](https://github.com/contensis/experience-engine/blob/main/packages/react/docs/PERSONALIZE.md)

A typical React component that renders a content Entry might look like this

The `ExampleHomePage` component renders a logo and the title from the Entry, then a `HeroBanner` component is fed props from the contents of the `hero` field

```tsx
import React from "react";

import HeroBanner from "~/components/hero/HeroBanner";
import Link from "~/components/link/link.component";

type HeroBannerProps = {
  audiences: string[];
  heading: string;
  leadIn: string;
  backgroundImageUrl?: string;
};

type ExampleHomePageEntry = {
  title: string;
  hero: HeroBannerProps;
  personalizedHero: HeroBannerProps[];
};

const ExampleHomePage = (entry: ExampleHomePageEntry) => {
  return (
    <div className="wrapper">
      <div className="logo">
        <Link path="/">
          <h1 className="sr-only">Example web app</h1>
          <Logo />
        </Link>
        <h1>{entry.title}</h1>
      </div>
      {/* Render HeroBanner props from the `hero` field */}
      <HeroBanner {...entry.hero} />
    </div>
  );
};

export default ExampleHomePage;
```

After updating the `ExampleHomePage` component to include the additional `personalizedHero` prop from the content Entry.

```tsx
import React from "react";
import { Personalize } from "@contensis/experience-engine-react";

import HeroBanner from "~/components/hero/HeroBanner";
import Link from "~/components/link/link.component";

const ExampleHomePage = (entry: ExampleHomePageEntry) => {
  return (
    <div className="wrapper">
      <div className="logo">
        <Link path="/">
          <h1 className="sr-only">Example web app</h1>
          <Logo />
        </Link>
        <h1>{entry.title}</h1>
      </div>
      <Personalize
        defaultContent={entry.hero}
        render={HeroBanner}
        variants={entry.personalizedHero}
      />
    </div>
  );
};

export default ExampleHomePage;
```

1. Replace component `<HeroBanner>` with `<Personalize>` component
2. `variants` prop is the repeating component Entry data
3. `render` prop or JSX children is the component(s) for rendering the personalized variant

One content variant will be chosen based on the current visitor's active audiences

If the current visitor is not a member of any audiences in the `variants` array, the component will pick the default variant to render from either

- the `defaultContent` prop
- a default variant from the `variants` array
  <br>(the first variant with no audiences defined)

The chosen variant will be provided to the `render` component (or JSX children) with render props for a single variant of the component - the same as if the component was being rendered with regular, non-personalized content (as in the previous example).

## Personalize anything

[`useExperienceEngineContext` hook](https://github.com/contensis/experience-engine/blob/main/packages/react/docs/USE_EXPERIENCE_ENGINE_CONTEXT.md) can be called in any component and will return properties and functions we can use when personalizing parts of your application

### [IsAudience](https://github.com/contensis/experience-engine/blob/main/packages/react/docs/USE_EXPERIENCE_ENGINE_CONTEXT.md#isaudience)

```tsx
import React from "react";
import { useExperienceEngineContext } from "@contensis/experience-engine-react";

const VisitorSpecificBanner = () => {
  const { isAudience } = useExperienceEngineContext();

  // isAudience returns true if any of the supplied
  // audience Ids have been made active
  return isAudience(["returningVisitor"]) ? (
    <div className="wrapper">
      Additional information for returning visitors!
    </div>
  ) : null;
};

export default VisitorSpecificBanner;
```

### Active audiences

```tsx
import React from "react";
import { useExperienceEngineContext } from "@contensis/experience-engine-react";

const VisitorSpecificBanner = () => {
  const { audiences } = useExperienceEngineContext();

  // Look for a specific audience the visitor has activated
  const isReturningVisitor = audiences.includes("returningVisitor");

  return isReturningVisitor ? (
    <div className="wrapper">
      Additional information for returning visitors!
    </div>
  ) : null;
};

export default VisitorSpecificBanner;
```

### Active signals

```tsx
import React from "react";
import { useExperienceEngineContext } from "@contensis/experience-engine-react";

const VisitorSpecificBanner = () => {
  const { signals } = useExperienceEngineContext();

  // Look for a specific signal the visitor has activated
  const isReturningVisitor = signals.includes("returningVisitor");

  return isReturningVisitor ? (
    <div className="wrapper">
      Additional information for returning visitors!
    </div>
  ) : null;
};

export default VisitorSpecificBanner;
```

## Custom Attributes

Custom attributes are configured in Contensis and can become part of the conditions to activate a signal

They allow developers to supply values produced within the app or provided by visitor actions for consideration when calculating signal and audience conditions

### [setAttributes](https://github.com/contensis/experience-engine/blob/main/packages/experience-engine/docs/EXPERIENCE_ENGINE_CONTEXT.md#setattributes)

Supply one or more custom attributes and then perform signal and audience calculations

```tsx
const { setAttributes } = useExperienceEngineContext();

/** Manage search input state */
const [searchInput, setSearchInput] = useState("");

/** Sets the attribute `custom.searchQuery` */
const handleSearchSubmit = (value = searchInput) => {
  /** We can call `setAttributes` any time we have captured
   *  the value(s) to use for the custom attribute(s) */
  setAttributes({
    searchQuery: value,
  });
};

return (
  <div>
    <input
      id="searchInput"
      type="text"
      placeholder={"Search"}
      value={searchInput}
      onChange={(e) => {
        setSearchInput(e.target.value);
      }}
      onKeyDown={(e) => {
        // Submit on Enter key
        if (e.key === "Enter") handleSearchSubmit(e.currentTarget.value);
      }}
    ></input>
    <button id="searchSubmit" onClick={() => handleSearchSubmit()}>
      Search
    </button>
  </div>
);
```

Attributes we have set will be calculated one time only

If our Manifest contains a signal that requires the above `custom.searchQuery` to match before it is activated, we can match and activate signals containing this condition at the time the search is performed and the value for the attribute has been set.

The attribute values are not stored and cannot be considered as a "previous" searchQuery in subsequent navigations or actions

### [overrideAttributes](https://github.com/contensis/experience-engine/blob/main/packages/experience-engine/docs/EXPERIENCE_ENGINE_CONTEXT.md#overrideattributes)

Permanently set a value for the given attribute(s). The overridden value will be used in all subsequent signal and audience calculations, or until the experience engine attributes are reset.

`overrideAttributes` can permanently set/override any of the signal attributes including built-in attributes. It may be useful to override a specific attribute with a specific value when debugging certain scenarios.

Following on from the previous example, if we wanted to hold and maintain the last input searchQuery, and consider this value in every signal and audience calculation going forward. We can use `overrideAttributes` instead.

`overrideAttributes` requires the fully qualified attribute key, exactly as would appear in the Manifest. For example `custom.searchQuery` or `page.domain`

```tsx
const { getAttributes, overrideAttributes, setAttributes } = useExperienceEngineContext();

/** Set custom attributes `searchQuery`, `lastSearchQuery` and `totalSearches` */
const handleSearchSubmit = (value = searchInput) => {
  setAttributes({
    searchQuery: value,
  });

  /** We can call `overrideAttributes` any time we wish
   *  to hold and maintain an attribute over time */
  overrideAttributes({
    "custom.lastSearchQuery": value,
    /** We could maintain a counter of previous interactions
     *  Recall a previously set attribute with `getAttributes` and increment */
    "custom.totalSearches": 1 + (getAttributes('custom.totalSearches') || 0);
  });
};
```

## Experiments

When running experiments (or A/B testing), similar to the `<Personalize />` component, the `<Experiment />` component will render one of a number of supplied content variants (experiments).

Except we are not rendering personalized content based on active audiences, instead each variant (experiment) contains a number field between 0 and 100 that constitutes where the experiment variants are "split" between each randomly assigned "bucket".

### Prerequisites

- [Curating content for experiments](https://github.com/contensis/experience-engine/blob/main/docs/EXPERIMENT_CONTENT.md)

### Example

```tsx
import React from "react";
import { Experiment } from "@contensis/experience-engine-react";

import LeadText from "~/components/lead/LeadText";

type ExampleHomePageEntry = {
  title: string;
  experiments: { lead: string; split: number }[];
};

const ExampleComponent = (entry: ExampleHomePageEntry) => {
  return (
    <div className="wrapper">
      <Experiment experiments={entry.experiments}>
        {(variant) => <LeadText {...variant} />}
      </Experiment>
    </div>
  );
};
```

1. Replace component `LeadText` with `Experiment` component
2. `experiments` prop is the repeating component Entry data
3. `render` prop or JSX children is the component(s) for rendering the correct variant

## FAQs

Check out some [Frequently Asked Questions](https://github.com/contensis/experience-engine/blob/main/docs/FAQS.md)

## Debugging

### Debug flag

Output trace information in console logs showing actions performed by the Experience Engine Context

Set the `debug` property in the `ExperienceEngineContext` to `true` to output trace logs. Use `"v"` for verbose logging.

### Use the Latest Manifest (unpublished / preview)

To test changes made to audiences and signals in Contensis prior to them being published, we can request the latest manifest version (instead of the default published version)

1. Set the `preview` property in the `ExperienceEngineContext` to `true`
2. If the `preview` property is updated after the `ExperienceEngineContext` has instantiated, also `reset` the manifest in the Experience Engine Context

### Browser Window object reference

The experience engine context can be examined or watched in the Console of the browser developer tools at any time from the browser's global scope

Type `window.CONTENSIS_XP.context` into the browser developer tools Console window

### Reset experience engine

Manually reset experience engine by deleting `localStorage` and `sessionStorage` in the browser developer tools for the current host.

Alternatively, we can manually reset experience engine by running the `reset()` function in the browser console using [the window object reference](#browser-window-object-reference):

```javascript
window.CONTENSIS_XP.context.reset();
```

Or we can reset some or all experience engine elements programatically in our components

```tsx
import React from "react";
import { useExperienceEngineContext } from "@contensis/experience-engine-react";

const ExampleComponent = () => {
  // First get a handle on the `context` object
  const { context } = useExperienceEngineContext();

  // examples are below
  return <div>...</div>;
};
```

#### Reset all experience engine state

```tsx
return (
  <div>
    <button
      id="reset"
      onClick={() => {
        context.reset();
      }}
    >
      Reset experience engine
    </button>
  </div>
);
```

#### Reset the Manifest

Set the `preview` flag and then reset the manifest to load the latest (unpublished) manifest version

```tsx
// Manage checkbox state
const [isPreviewChecked, setIsPreviewChecked] = useState(context.preview);

return (
  <div>
    <label>
      <input
        id="isPreviewChecked"
        type="checkbox"
        checked={isPreviewChecked}
        onChange={(event) => {
          // Update the preview flag in the context
          context.preview = event.target.checked;

          // Reset the experience engine manifest
          context.reset({ manifest: true });

          // Handle component state
          setIsPreviewChecked(context.preview);
        }}
      />
      Preview manifest
    </label>
  </div>
);
```

#### Reset all Audiences / Signals

```tsx
return (
  <div>
    <button
      id="resetAudiences"
      onClick={() => {
        context.reset({
          audiences: true,
          // It makes sense to also reset signals
          // at the same time so we can avoid
          // immediately reactivating any audiences
          // via previously matched signals
          signals: true,
        });
      }}
    >
      Reset audiences
    </button>
  </div>
);
```

#### Reset all Attributes

Clears all custom and overridden attributes

```tsx
return (
  <div>
    <button
      id="resetAttributes"
      onClick={() => {
        context.reset({
          attributes: true,
        });
      }}
    >
      Reset attributes
    </button>
  </div>
);
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
