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
  identifyAccountLogicFunctionUniversalIdentifier?: string;
  onConnectLogicFunctionUniversalIdentifier?: string;
  onDisconnectLogicFunctionUniversalIdentifier?: string;
  /** @deprecated Use `identifyAccountLogicFunctionUniversalIdentifier` instead. */
  identifyAccountLogicFunction?: SyncableEntityOptions;
  /** @deprecated Use `onConnectLogicFunctionUniversalIdentifier` instead. */
  onConnectLogicFunction?: SyncableEntityOptions;
  /** @deprecated Use `onDisconnectLogicFunctionUniversalIdentifier` instead. */
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
    | { type: 'api-key' }
  );
