// Discriminator on `connectionProvider.type`. Each value pairs with a
// typed sub-config column on the entity:
//   - 'oauth'  — `oauthConfig`: core runs the OAuth authorization code flow
//   - 'custom' — `customConfig`: the app's authorize and callback logic
//                functions drive a provider-specific flow (hosted auth
//                links, account ids delivered by webhook, ...)
//
// Anticipated future values:
//   - 'apiKey'    — single long-lived token in an applicationVariable
//   - 'pat'       — per-user personal access token entered at connect time
//   - 'basicAuth' — username + password
//
// Adding a value is purely additive: define the new sub-config column on
// the entity, the manifest type, and the SDK; existing callers keep working.
export type ConnectionProviderType = 'oauth' | 'custom';
