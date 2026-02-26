import { type ApplicationVariables } from './applicationVariablesType';
import { type ServerVariables } from './server-variables.type';
import { type SyncableEntityOptions } from './syncableEntityOptionsType';

export type ApplicationManifest = SyncableEntityOptions & {
  defaultRoleUniversalIdentifier: string;
  displayName: string;
  description: string;
  icon?: string;
  applicationVariables?: ApplicationVariables;
  serverVariables?: ServerVariables;
  author?: string;
  category?: string;
  logoUrl?: string;
  screenshots?: string[];
  aboutDescription?: string;
  providers?: string[];
  websiteUrl?: string;
  termsUrl?: string;
  preInstallLogicFunctionUniversalIdentifier?: string;
  postInstallLogicFunctionUniversalIdentifier?: string;
  settingsCustomTabFrontComponentUniversalIdentifier?: string;
  packageJsonChecksum: string | null;
  yarnLockChecksum: string | null;
  apiClientChecksum: string | null;
};
