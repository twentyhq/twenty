import { type OAuthConnectionProviderConfig } from '@/application/oauthConnectionProviderConfigType';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type ConnectionProviderManifest = SyncableEntityOptions & {
  name: string;
  displayName: string;
  type: 'oauth';
  oauth: OAuthConnectionProviderConfig;
  // universalIdentifier of a logic function of the same application, enqueued
  // after each successful OAuth connect (and reconnect) of this provider.
  onConnectLogicFunctionUniversalIdentifier?: string;
};
