import { type ApplicationVariables } from '@/sdk';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type ApplicationMarketplaceData = {
  author?: string;
  category?: string;
  logo?: string;
  screenshots?: string[];
  aboutDescription?: string;
  providers?: string[];
  websiteUrl?: string;
  termsUrl?: string;
};

export type ApplicationManifest = SyncableEntityOptions & {
  defaultRoleUniversalIdentifier: string;
  displayName?: string;
  description?: string;
  icon?: string;
  applicationVariables?: ApplicationVariables;
  marketplaceData?: ApplicationMarketplaceData;
};
