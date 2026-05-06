// Discriminator on `connectionProvider.type`. Each value pairs with a
// typed sub-config column on the entity (today only `oauthConfig`).
//
// Anticipated future values:
//   - 'apiKey'    — single long-lived token in an applicationVariable
//   - 'pat'       — per-user personal access token entered at connect time
//   - 'basicAuth' — username + password
//
// Adding a value is purely additive: define the new sub-config column on
// the entity, the manifest type, and the SDK; existing 'oauth' callers
// keep working.
export type ConnectionProviderType = 'oauth';
