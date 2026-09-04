import { type OAuthConnectionProviderIdentityConfig } from '@/application/oauthConnectionProviderIdentityConfigType';
import { type OAuthProviderTokenRequestContentType } from '@/application/oauthProviderTokenRequestContentType.type';

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
  identity?: OAuthConnectionProviderIdentityConfig;
};
