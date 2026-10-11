import { type OAuthConnectionProviderConfig } from '@/application/oauthConnectionProviderConfigType';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type ConnectedAccountVisibility } from '@/types/ConnectedAccountVisibility';

export type ConnectionProviderManifest = SyncableEntityOptions & {
  name: string;
  displayName: string;
  allowedVisibilities?: ConnectedAccountVisibility[];
  logo?: string;
  type: 'oauth';
  oauth: OAuthConnectionProviderConfig;
  identifyAccountLogicFunction?: SyncableEntityOptions;
  onConnectLogicFunction?: SyncableEntityOptions;
  onDisconnectLogicFunction?: SyncableEntityOptions;
};
