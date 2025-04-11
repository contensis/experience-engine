## Personalization Provider Props

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

### Provide your own manifest

The `PersonalizationProvider` component accepts a `manifest` prop where we can simply provide a JSON object that serves as the [Manifest document](https://github.com/contensis/personalization/blob/main/docs/MANIFEST.md).

This can be useful for developers who are testing new Personalization conditions and how to apply them

- [Manifest TypeScript definition](https://github.com/contensis/personalization/blob/main/packages/personalization/src/models/api/Manifest.d.ts)
- [Example Manifest document](https://github.com/contensis/personalization/blob/main/cypress/fixtures/audiences.signals-manifest.json)
- [Example Manifest usage](https://github.com/contensis/personalization/blob/main/apps/react/src/App.tsx)

When a manifest has been provided, the Personalization Context will not request a manifest from Contensis and will not require the `alias`, `projectId` or `rootUrl` props.
