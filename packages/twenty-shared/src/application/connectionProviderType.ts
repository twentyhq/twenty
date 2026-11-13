// Each value with settings pairs with a typed sub-config column on the entity
export type ConnectionProviderType =
  | 'oauth'
  | 'oauth-discovery'
  | 'custom'
  | 'api-key';
