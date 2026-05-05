// Discriminator over how a connection's credentials are obtained. Today only
// `oauth` is supported. Future credential types (PATs, API keys, basic auth)
// add new `type` values + their own sub-config block alongside `oauth` —
// purely additive, no breaking change for app developers.
export type ConnectionProviderType = 'oauth';
