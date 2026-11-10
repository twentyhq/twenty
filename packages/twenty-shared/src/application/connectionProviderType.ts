// Discriminator on `connectionProvider.type`. 'oauth' and 'custom' pair with a
// typed sub-config column on the entity; 'apiKey' needs none.
export type ConnectionProviderType = 'oauth' | 'custom' | 'apiKey';
