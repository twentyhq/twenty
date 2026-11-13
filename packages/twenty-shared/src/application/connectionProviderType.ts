// Discriminator on `connectionProvider.type`. 'oauth', 'oauth-discovery' and
// 'custom' pair with a typed sub-config column on the entity; 'apiKey' needs none.
export type ConnectionProviderType =
  | 'oauth'
  | 'oauth-discovery'
  | 'custom'
  | 'apiKey';
