import { type OAuthDiscoveryConnectionProviderConfig } from '@/application/oauthDiscoveryConnectionProviderConfigType';

// Stored as declared: discovery happens at connect time, so nothing is resolved at sync
export type StoredOAuthDiscoveryConnectionProviderConfig =
  OAuthDiscoveryConnectionProviderConfig;
