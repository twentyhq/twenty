import { type ConnectionProviderScope } from '@/application/connectionProviderScopeType';
import { type OAuthConnectionProviderConfig } from '@/application/oauthConnectionProviderConfigType';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type ConnectionProviderManifest = SyncableEntityOptions & {
  name: string;
  displayName: string;
  logo?: string;
  type: 'oauth';
  scope?: ConnectionProviderScope;
  oauth: OAuthConnectionProviderConfig;
  identifyAccountLogicFunction?: SyncableEntityOptions;
  onConnectLogicFunction?: SyncableEntityOptions;
  onDisconnectLogicFunction?: SyncableEntityOptions;
};
