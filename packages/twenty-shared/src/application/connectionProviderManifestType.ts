import { type OAuthConnectionProviderConfig } from '@/application/oauthConnectionProviderConfigType';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type ConnectionProviderManifest = SyncableEntityOptions & {
  name: string;
  displayName: string;
  // Relative path into the app's bundled public/ folder, e.g. 'public/logo.svg'.
  // Mirrors defineApplication({ logo }).
  logo?: string;
  type: 'oauth';
  oauth: OAuthConnectionProviderConfig;
  onConnectLogicFunction?: SyncableEntityOptions;
};
