import { type ApplicationVariables } from './applicationVariablesType';
import { type ServerVariables } from './serverVariablesType';
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
  logo?: string;
  screenshots?: string[];
  aboutDescription?: string;
  providers?: string[];
  websiteUrl?: string;
  termsUrl?: string;
  preInstallLogicFunctionUniversalIdentifier?: string;
  postInstallLogicFunctionUniversalIdentifier?: string;
  packageJsonChecksum: string | null;
  yarnLockChecksum: string | null;
  apiClientChecksum: string | null;
};
