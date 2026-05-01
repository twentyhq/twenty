import { type OAuthProviderConnectionMode } from '@/application/oauthProviderConnectionMode.type';
import { type OAuthProviderTokenRequestContentType } from '@/application/oauthProviderTokenRequestContentType.type';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type OAuthProviderManifest = SyncableEntityOptions & {
  name: string;
  displayName: string;
  icon?: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  revokeEndpoint?: string;
  scopes: string[];
  connectionMode: OAuthProviderConnectionMode;
  clientIdVariable: string;
  clientSecretVariable: string;
  accessTokenExpiresInMs?: number;
  authorizationParams?: Record<string, string>;
  tokenRequestContentType?: OAuthProviderTokenRequestContentType;
  usePkce?: boolean;
};
