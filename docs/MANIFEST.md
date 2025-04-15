## Personalization Manifest

The "Manifest" is an object returned by the Contensis Delivery API that contains Audience and Signal definitions and the conditions that have been set up to trigger them

When using the Audience and Signals editor in Contensis, the `Publish` activity will cause this "Manifest" to be updated and a new version will be delivered to website visitors in projects configured to use Personalization.

### Provide your own manifest

The [`PersonalizationContext` class](https://github.com/contensis/personalization/blob/main/packages/react/docs/PERSONALIZATION_PROVIDER.md) or [`PersonalizationProvider` component](https://github.com/contensis/personalization/blob/main/packages/personalization/docs/PERSONALIZATION_CONTEXT.md) accepts a `manifest` prop where we can simply provide a JSON object that serves as the [Manifest document](https://github.com/contensis/personalization/blob/main/docs/MANIFEST.md).

This can be useful for developers who are testing new Personalization conditions and how to apply them

- [Manifest TypeScript definition](https://github.com/contensis/personalization/blob/main/packages/personalization/src/models/api/Manifest.d.ts)
- [Example Manifest document](https://github.com/contensis/personalization/blob/main/cypress/fixtures/audiences.signals-manifest.json)
- [Example Manifest usage](https://github.com/contensis/personalization/blob/main/apps/react/src/App.tsx)

When a manifest has been provided, the Personalization Context will not request a manifest from Contensis and will not require the `alias`, `projectId` or `rootUrl` props.
