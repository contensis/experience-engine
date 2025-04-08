# [![Contensis](https://github.com/contensis/cli/raw/refs/heads/main/assets/contensis-logo--tiny.svg)](https://www.contensis.com) @contensis/personalization-react [![NPM version](https://img.shields.io/npm/v/@contensis/personalization-react.svg?style=flat)](https://www.npmjs.com/package/@contensis/personalization-react)

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)[![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Provides a context wrapper, hooks and components to easily leverage personalization with Contensis in your React projects

## Installation

```bash
npm install --save @contensis/personalization-react
```

```bash
yarn add --save @contensis/personalization-react
```

## Configuration

### PersonalizationProvider component

Wrap your "`App`" root component with a `PersonalizationProvider`

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PersonalizationProvider } from "@contensis/personalization-react";

import { MainLayout } from "./App";

// Our React App
const App = () => {
  return (
    <div className="content">
      <PersonalizationProvider alias="example" projectId="website">
        <MainLayout />
      </PersonalizationProvider>
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

#### Props

| Prop            | Type          | Description                                                                                                                 |
| --------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| alias           | string        | Contensis Cloud alias for the project containing our Audiences                                                              |
| projectId       | string        | API ID of the project containing our Audiences                                                                              |
| preview         | boolean       | Set `true` to request the latest (unpublished) Manifest                                                                     |
| rootUrl         | string        | Used instead of `alias` to fetch the Manifest from a specific hostname                                                      |
| manifest        | Manifest      | The complete Manifest to use in this personalization context. Used instead of `alias` and `projectId`                       |
| debug           | boolean / `v` | Set `true` to enable console logging, `v`erbose outputs raw logs that show the correct sequence each log message was output |
| onComputed      | Function      | Custom handler called each time signals and audiences are computed                                                          |
| onInit          | Function      | Custom handler called one time when the Personalization Context is initialized                                              |
| onManifestReady | Function      | Custom handler called each time a manifest has been loaded                                                                  |
| onNavigate      | Function      | Custom handler called each time the Personalization Context detects navigation within a SPA                                 |
| onPageView      | Function      | Custom handler called each time the Personalization Context has registered a Page View                                      |

### Event Handlers

A custom event handler can be added via the Personalization Provider props and will be available to the Personalization Context from the time it is created.

| Prop            | Type     | Description                                                                                 |
| --------------- | -------- | ------------------------------------------------------------------------------------------- |
| onComputed      | Function | Custom handler called each time signals and audiences are computed                          |
| onInit          | Function | Custom handler called one time when the Personalization Context is initialized              |
| onManifestReady | Function | Custom handler called each time a manifest has been loaded                                  |
| onNavigate      | Function | Custom handler called each time the Personalization Context detects navigation within a SPA |
| onPageView      | Function | Custom handler called each time the Personalization Context has registered a Page View      |

### Manifest

The "Manifest" is an object that is fetched from the Contensis Delivery API that contain the Audience and Signal definitions and the conditions that have been set up to trigger them

When using the Audience and Signals editor in Contensis, the `Publish` activity will cause this "Manifest" to be updated and a new version will be delivered to website visitors in projects configured to use Personalization.

#### Provide your own manifest

The `PersonalizationProvider` component accepts a `manifest` prop where we can simply provide a JSON object that serves as the Manifest document.

This can be useful for developers who are testing new Personalization conditions and how to apply them

- [Manifest TypeScript definition](../../packages/personalization/src/models/api/Manifest.d.ts)
- [Example Manifest document](../../cypress/fixtures/audiences.signals-manifest.json)
- [Example Manifest usage](../../apps/react/src/App.tsx)

When a manifest has been provided, the Personalization Context will not request a manifest from Contensis and will not require the `alias`, `projectId` or `rootUrl` props.

## Personalize content variations

### Ensure Content is Personalized

When working with Contensis, it is normal to render the content fields of an Entry of a specific content type that has fields containing the content for the current "page".

For this example, our Entry uses a Component field set up in the Content Type called `personalizedHero`. The Component field is configured to be repeatable. We will add multiples of this Component field for every audience we wish to tailor the content for.

The Component is defined with an Audience Picker field in addition to the content field(s) encapsulated within this component.

We will also use the original `hero` field in the Content Type that serves as the default version (the variation we will render when the visitor matches no audiences in the `personalizedHero`). We could drop the `hero` field from this Content Type and use only the `personalizedHero` field, but we would have to include a variant of the component that serves as the default version to render in each Entry.

```json
{
  "id": "exampleHomePage",
  "projectId": "website",
  "dataFormat": "entry",
  "name": {
    "en-GB": "Example: Home Page"
  },
  "entryTitleField": "title",
  "fields": [
    {
      "id": "title",
      "name": {
        "en-GB": "Title"
      },
      "dataType": "string",
      "dataFormat": "heading",
      "groupId": "main"
    },
    {
      "id": "hero",
      "name": {
        "en-GB": "Hero"
      },
      "dataType": "object",
      "dataFormat": "component.personalizedhero",
      "groupId": "main"
    },
    {
      "id": "personalizedHero",
      "name": {
        "en-GB": "Personalized Hero"
      },
      "dataType": "objectArray",
      "dataFormat": "component.personalizedhero",
      "editor": {
        "properties": {
          "componentButtonLabel": "Add personalized variant"
        }
      },
      "groupId": "main"
    }
  ]
}
```

_Example Content Type JSON_

```json
{
  "id": "personalizedHero",
  "projectId": "website",
  "dataFormat": "component",
  "name": {
    "en-GB": "Personalized Hero"
  },
  "description": {
    "en-GB": "Create personalized variations for any audience"
  },
  "fields": [
    {
      "id": "audiences",
      "name": {
        "en-GB": "Audiences"
      },
      "dataType": "objectArray",
      "dataFormat": "audience",
      "validations": {
        "allowedIds": {
          "ids": ["returningVisitors", "potentialStudents", "campaignSignUp"]
        }
      },
      "editor": {
        "instructions": {
          "en-GB": "Choose one or more audiences that will have this variant rendered"
        },
        "properties": {
          "componentButtonLabel": "Add another audience"
        }
      }
    },
    {
      "id": "heading",
      "name": {
        "en-GB": "Heading"
      },
      "dataType": "string"
    },
    {
      "id": "leadIn",
      "name": {
        "en-GB": "Lead-In"
      },
      "dataType": "string",
      "editor": {
        "id": "text"
      }
    },
    {
      "id": "backgroundImage",
      "name": {
        "en-GB": "Background image"
      },
      "dataType": "object",
      "dataFormat": "image",
      "editor": {
        "properties": {
          "uploadPath": "/image-library",
          "filterPaths": ["/image-library"]
        }
      }
    }
  ]
}
```

_Example Personalized Hero Component JSON_

### With Personalize component

Render an Entry containing content

```jsx
import React from "react";

import HeroBanner, { HeroBannerProps } from "~/components/hero/HeroBanner";
import Link from "~/components/link/link.component";

export type ExampleHomePageProps = {
  title: string,
  hero: HeroBannerProps,
};

const ExampleHomePage = (entry: ExampleHomePageProps) => {
  return (
    <div className="wrapper">
      <div className="logo">
        <Link path="/">
          <h1 className="sr-only">Example web app</h1>
          <svg />
        </Link>
        <h1>{entry.title}</h1>
      </div>
      <HeroBanner {...entry.hero} />
    </div>
  );
};

export default ExampleHomePage;
```

```jsx
import React from "react";
import { Personalize } from "@contensis/personalization-react";

import Link from "~/components/link/link.component";
import HeroBanner, { HeroBannerProps } from "~/components/hero/HeroBanner";

export type ExampleHomePageProps = {
  title: string,
  hero: HeroBannerProps,
  personalizedHero: HeroBannerProps[],
};

const ExampleHomePage = (entry: ExampleHomePageProps) => {
  return (
    <div className="wrapper">
      <div className="logo">
        <Link path="/">
          <h1 className="sr-only">Example web app</h1>
          <svg />
        </Link>
        <h1>{entry.title}</h1>
      </div>
      <Personalize
        audienceKey="audienceId"
        variants={entry.personalizedHero}
        defaultContent={entry.hero}
      >
        {(heroProps) => <HeroBanner {...heroProps} />}
      </Personalize>
    </div>
  );
};

export default ExampleHomePage;
```

## Personalize anything

### IsAudience

### Via signal matches

## Experiments

## Debugging

### Debug flag

### Use the Latest Manifest (unpublished / preview)

### Reset personalization

## License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC). For detailed terms, please refer to the license file included in this repository.

### Attribution

This project makes use of the following dependencies and data sources, which are governed by separate licenses:

#### 1. [`caniuse-lite`](https://github.com/browserslist/caniuse-lite)

The project indirectly utilizes data from `caniuse-lite` as part of its build tooling. The data, sourced from [caniuse.com](https://caniuse.com), is made available under the **Creative Commons Attribution 4.0 International [(CC BY 4.0)](http://creativecommons.org/licenses/by/4.0/)** license. For more information, visit [the repository](https://github.com/browserslist/caniuse-lite#license).

#### 2. [`spdx-exceptions`](https://github.com/kemitchell/spdx-exceptions.json#readme)

This project indirectly references the `spdx-exceptions` package as part of its build tooling. Portions of the data used are derived from version 2.0 of the SPDX specification, licensed under the **Creative Commons Attribution 3.0 Unported [(CC-BY-3.0)](http://creativecommons.org/licenses/by/3.0/)** license. For details, see [the repository](https://github.com/kemitchell/spdx-exceptions.json#readme).

---
