import { type OAuthProviderTokenRequestContentType } from '@/application/oauthProviderTokenRequestContentType.type';
import { type OAuthProviderTokenEndpointAuthMethod } from '@/application/oauthProviderTokenEndpointAuthMethod.type';

export type OAuthConnectionProviderConfig = {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  revokeEndpoint?: string;
  scopes: string[];
  clientIdVariable: string;
  clientSecretVariable: string;
  authorizationParams?: Record<string, string>;
  tokenEndpointAuthMethod?: OAuthProviderTokenEndpointAuthMethod;
  tokenRequestContentType?: OAuthProviderTokenRequestContentType;
  usePkce?: boolean;
};
