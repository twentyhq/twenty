import { type OAuthProviderTokenRequestContentType } from '@/application/oauthProviderTokenRequestContentType.type';

// The resolved/normalized form of `OAuthConnectionProviderConfig` as written
// to the `connectionProvider.oauthConfig` JSONB column. Manifest defaults
// (`tokenRequestContentType`, `usePkce`) are filled at write time so reads
// on the entity never need to re-apply them.
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
