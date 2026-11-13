// Discriminator on `connectionProvider.type`. Each value that needs settings
// pairs with a typed sub-config column on the entity; 'api-key' has none.
//
// Anticipated future values:
//   - 'basicAuth' — username + password
//
// Adding a value is purely additive: define the new sub-config column on
// the entity, the manifest type, and the SDK; existing callers keep working.
export type ConnectionProviderType =
  | 'oauth'
  | 'oauth-discovery'
  | 'custom'
  | 'api-key';
