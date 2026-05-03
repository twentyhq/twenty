import { type OAuthProviderTokenRequestContentType } from '@/application/oauthProviderTokenRequestContentType.type';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

// Discriminator over how a connection's credentials are obtained. Today only
// `oauth` is supported. Future credential types (PATs, API keys, basic auth)
// add new `type` values + their own sub-config block alongside `oauth` —
// purely additive, no breaking change for app developers.
export type ConnectionProviderType = 'oauth';

type CommonConnectionProviderFields = SyncableEntityOptions & {
  name: string;
  displayName: string;
  icon?: string;
};

export type OAuthConnectionProviderConfig = {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  revokeEndpoint?: string;
  scopes: string[];
  clientIdVariable: string;
  clientSecretVariable: string;
  authorizationParams?: Record<string, string>;
  tokenRequestContentType?: OAuthProviderTokenRequestContentType;
  usePkce?: boolean;
};

export type ConnectionProviderManifest = CommonConnectionProviderFields & {
  type: 'oauth';
  oauth: OAuthConnectionProviderConfig;
};
