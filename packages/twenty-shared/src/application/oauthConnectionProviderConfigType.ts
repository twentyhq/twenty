import { type OAuthProviderTokenRequestContentType } from '@/application/oauthProviderTokenRequestContentType';

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
