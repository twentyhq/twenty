# AI frontend component record context

AI-created record-page widgets use `useSelectedRecordIds()` and
`useSelectedObjectMetadata()` from `twenty-sdk/front-component`, like app-authored
widgets. Other exports from that module are not available in the AI builder.

- Preview selects the first fictional sample record and supplies the validated
  query object's ID and singular/plural names. That sample needs a UUID `id`.
- Dashboard previews have no selection.
- Saved widgets receive the viewed record from the normal widget renderer.
  Query by that ID and reload when it changes; never embed a sample ID in source.
- Preview SDK reads use sample data. ID-equality filters are supported; this is
  not a general query evaluator. Mutations remain disabled and host actions are
  no-ops.

## Updating the bundled hooks

The Workspace app need not install `twenty-sdk`. The AI builder bundles the two
SDK hooks and their declarations, generated from the SDK source. React still
comes from the app's shared dependencies, so the hooks use the component's React
instance. No additional runtime import or sandbox capability is introduced.

After changing the SDK hooks, build `twenty-shared`, then run from the repo root:

```sh
yarn tsx packages/twenty-sdk/scripts/build-ai-front-component-context.ts
yarn oxfmt packages/twenty-server/src/engine/metadata-modules/ai/ai-front-component/constants/generated/front-component-context-module.json
```

The SDK unit suite checks that the bundled code and declarations match the source.
