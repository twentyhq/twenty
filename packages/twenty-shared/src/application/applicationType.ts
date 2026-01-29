import { type ApplicationVariables } from '@/application';
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

export type Application = SyncableEntityOptions & {
  functionRoleUniversalIdentifier: string;
  displayName?: string;
  description?: string;
  icon?: string;
  applicationVariables?: ApplicationVariables;
  marketplaceData?: ApplicationMarketplaceData;
};
