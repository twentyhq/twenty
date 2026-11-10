import { type ConnectionProviderScope } from '@/application/connectionProviderScopeType';
import { type CustomConnectionProviderConfig } from '@/application/customConnectionProviderConfigType';
import { type OAuthConnectionProviderConfig } from '@/application/oauthConnectionProviderConfigType';
import { type OAuthDiscoveryConnectionProviderConfig } from '@/application/oauthDiscoveryConnectionProviderConfigType';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

type ConnectionProviderManifestBase = SyncableEntityOptions & {
  name: string;
  displayName: string;
  logo?: string;
  scope?: ConnectionProviderScope;
  identifyAccountLogicFunction?: SyncableEntityOptions;
  onConnectLogicFunction?: SyncableEntityOptions;
  onDisconnectLogicFunction?: SyncableEntityOptions;
};

export type ConnectionProviderManifest = ConnectionProviderManifestBase &
  (
    | { type: 'oauth'; oauth: OAuthConnectionProviderConfig }
    | {
        type: 'oauth-discovery';
        oauthDiscovery: OAuthDiscoveryConnectionProviderConfig;
      }
    | { type: 'custom'; custom: CustomConnectionProviderConfig }
  );
