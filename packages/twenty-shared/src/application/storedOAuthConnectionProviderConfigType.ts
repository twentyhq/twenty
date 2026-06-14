import { type OAuthProviderTokenRequestContentType } from '@/application/oauthProviderTokenRequestContentType.type';

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
};
