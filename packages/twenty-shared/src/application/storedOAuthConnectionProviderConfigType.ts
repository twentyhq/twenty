import { type OAuthConnectionProviderIdentityMethod } from '@/application/oauthConnectionProviderIdentityConfigType';
import { type OAuthProviderTokenRequestContentType } from '@/application/oauthProviderTokenRequestContentType.type';

export type StoredOAuthConnectionProviderIdentityConfig = {
  endpoint: string;
  method: OAuthConnectionProviderIdentityMethod;
  body: string | null;
  accountIdPath: string;
  labelPath: string | null;
};

// Resolved form of `OAuthConnectionProviderConfig` as stored in the
// `connectionProvider.oauthConfig` JSONB column — manifest defaults are
// filled at write time.
export type StoredOAuthConnectionProviderConfig = {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  revokeEndpoint: string | null;
  scopes: string[];
  clientIdVariable: string;
  clientSecretVariable: string;
  authorizationParams: Record<string, string> | null;
  tokenRequestContentType: OAuthProviderTokenRequestContentType;
  usePkce: boolean;
  // Optional unlike its siblings: rows written before this field existed have
  // no `identity` key at all, so reads must guard with isDefined, not `!== null`.
  identity?: StoredOAuthConnectionProviderIdentityConfig | null;
};
