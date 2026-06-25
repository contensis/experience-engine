## Experience Engine Manifest

The "Manifest" is an object returned by the Contensis Delivery API that contains Audience and Signal definitions and the conditions that have been set up to trigger them

When using the Audience and Signals editor in Contensis, the `Publish` activity will cause this "Manifest" to be updated and a new version will be delivered to website visitors in projects configured to use Experience Engine.

### Provide your own manifest

The [`ExperienceEngineContext` class](https://github.com/contensis/experience-engine/blob/main/packages/react/docs/PERSONALIZATION_PROVIDER.md) or [`ExperienceEngineProvider` component](https://github.com/contensis/experience-engine/blob/main/packages/experience-engine/docs/EXPERIENCE_ENGINE_CONTEXT.md) accepts a `manifest` prop where we can simply provide a JSON object that serves as the [Manifest document](https://github.com/contensis/experience-engine/blob/main/docs/MANIFEST.md).

This can be useful for developers who are testing new Experience Engine conditions and how to apply them

- [Manifest TypeScript definition](https://github.com/contensis/experience-engine/blob/main/packages/experience-engine/src/models/api/Manifest.d.ts)
- [Example Manifest document](https://github.com/contensis/experience-engine/blob/main/cypress/fixtures/audiences.signals-manifest.json)
- [Example Manifest usage](https://github.com/contensis/experience-engine/blob/main/apps/react/src/App.tsx)

When a manifest has been provided, the Experience Engine Context will not request a manifest from Contensis and will not require the `alias`, `projectId` or `rootUrl` props.
