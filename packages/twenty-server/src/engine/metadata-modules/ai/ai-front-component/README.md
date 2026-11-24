# AI frontend component SDK

AI-created widgets can import the public `twenty-sdk/front-component` API,
including context hooks, translation helpers, components and host actions.
The builder bundles the public SDK entry point and its declarations directly.
There is no separate list of supported exports.

## Preview behavior

- Record-page preview selects the first fictional sample record and supplies the
  query object's ID and names. That sample needs a UUID `id`. This previews
  widgets displaying the selected record itself, not queries for a different
  object related to the viewed record.
- Dashboard previews have no selection. Context hooks update when context changes;
  unavailable context, such as the current user, remains null or unset.
- Core API reads use sample data. Only direct ID-equality filtering is evaluated.
  Mutations and Metadata API calls fail explicitly in preview.
- Host actions reject with `FRONT_COMPONENT_PREVIEW_HOST_ACTION_UNAVAILABLE`.
  Preview cannot navigate, open host panels or confirmation modals, upload files,
  copy to the clipboard, persist storage, or change chat tool arguments.
  Handle these rejections in interactive widgets. Saved widgets use the normal
  host bridge and application permissions.
- `inboxMention` and `inboxReferenceRecord` require `twenty-client-sdk/rest`,
  which the renderer cannot load. Builds using those helpers fail with an
  explicit diagnostic. Other inbox helpers use the Metadata API client and
  compile, but cannot execute in preview.

## Updating the bundled SDK

The Workspace app need not install `twenty-sdk`. Runtime code and declarations
come from `twenty-sdk/src/sdk/front-component/index.ts`. React comes from the
app's shared dependencies; API clients come from the renderer.

After changing the SDK, build `twenty-shared`, then run from the repo root:

```sh
yarn tsx packages/twenty-sdk/scripts/build-ai-front-component-sdk.ts
```

The SDK unit suite checks that bundled code and declarations match the source.
