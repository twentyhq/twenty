# twenty-client-sdk compatibility check for PR #25116

PR #25116 changes the workspace GraphQL schema: composite sub-fields stored as
raw JSON (`emails.additionalEmails`, `phones.additionalPhones`,
`links.secondaryLinks`, `actor.context`) become real GraphQL types instead of
the `JSON` scalar. The `api-breaking-changes` CI check flags this as breaking.
This harness verifies whether it actually breaks a deployed consumer of the
published `twenty-client-sdk`.

## What it does

Two consumers hit the same server (running the PR branch), make the same
logical requests (reads, create, update, destroy on the composite fields), and
their results are compared:

- `npm-consumer/`: `twenty-client-sdk` from npm (latest published), core client
  generated from the **pre-PR** schema. This reproduces an app generated before
  the PR that keeps running against an upgraded server, selecting the composite
  sub-fields as `JSON` leaves and sending raw JSON mutation inputs.
- `local-consumer/`: `twenty-client-sdk` built from this branch, core client
  generated from the **post-PR** schema, selecting the sub-fields as typed
  objects.

## How to run

```bash
# deps
npm install                                     # graphql, for introspection
(cd npm-consumer && npm install twenty-client-sdk@<latest>)
# build the local SDK, pack it, install the tarball into local-consumer

# 1. with the server running on main: capture the old schema
node introspect-schema.mjs schema-old.graphql

# 2. with the server running on the PR branch: capture the new schema
node introspect-schema.mjs schema-new.graphql

# 3. generate each consumer's client (same path the twenty-sdk CLI uses)
node generate-client.mjs npm-consumer schema-old.graphql
node generate-client.mjs local-consumer schema-new.graphql

# 4. run both scenarios against the PR server and compare
node run-npm-sdk.mjs
node run-local-sdk.mjs
node compare-results.mjs
```

Auth uses the seeded dev workspace (`tim@apple.dev`). `compare-results.mjs`
normalizes record ids (each run creates its own records) and `__typename`
(only requested by the new client), then reports any remaining difference.
