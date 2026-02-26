import { type ApplicationVariables } from './applicationVariablesType';
import { type ServerVariables } from './serverVariablesType';
import { type SyncableEntityOptions } from './syncableEntityOptionsType';

export type ApplicationManifest = SyncableEntityOptions & {
  defaultRoleUniversalIdentifier: string;
  postInstallLogicFunctionUniversalIdentifier?: string;
  displayName: string;
  description: string;
  icon?: string;
  applicationVariables?: ApplicationVariables;
  serverVariables?: ServerVariables;
  author?: string;
  logoUrl?: string;
  category?: string;
  screenshots?: string[];
  aboutDescription?: string;
  providers?: string[];
  websiteUrl?: string;
  termsUrl?: string;
  packageJsonChecksum: string | null;
  yarnLockChecksum: string | null;
  apiClientChecksum: string | null;
};
