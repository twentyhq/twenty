import { type ApplicationVariables } from './applicationVariablesType';
import { type SyncableEntityOptions } from './syncableEntityOptionsType';

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
  postInstallLogicFunctionUniversalIdentifier?: string;
  displayName: string;
  description: string;
  icon?: string;
  applicationVariables?: ApplicationVariables;
  marketplaceData?: ApplicationMarketplaceData;
  packageJsonChecksum: string | null;
  yarnLockChecksum: string | null;
  apiClientChecksum: string | null;
};
