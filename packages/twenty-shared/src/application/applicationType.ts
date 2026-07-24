import { type PostInstallLogicFunctionApplicationManifest } from '@/application/postInstallLogicFunctionApplicationType';
import { type PreInstallLogicFunctionApplicationManifest } from '@/application/preInstallLogicFunctionApplicationType';
import { type UninstallLogicFunctionApplicationManifest } from '@/application/uninstallLogicFunctionApplicationType';
import { type ApplicationCategory } from './applicationCategoryType';
import { type ApplicationVariables } from './applicationVariablesType';
import { type ServerVariables } from './server-variables.type';
import { type SyncableEntityOptions } from './syncableEntityOptionsType';

export type ApplicationManifest = SyncableEntityOptions & {
  defaultRoleUniversalIdentifier: string;
  displayName: string;
  description: string;
  applicationVariables?: ApplicationVariables;
  serverVariables?: ServerVariables;
  author?: string;
  category?: ApplicationCategory;
  /**
   * @deprecated Use `logo` instead.
   */
  logoUrl?: string;
  logo?: string;
  /**
   * @deprecated Use `galleryImages` instead.
   */
  screenshots?: string[];
  galleryImages?: string[];
  aboutDescription?: string;
  websiteUrl?: string;
  termsUrl?: string;
  emailSupport?: string;
  issueReportUrl?: string;
  postInstallLogicFunction?: PostInstallLogicFunctionApplicationManifest;
  preInstallLogicFunction?: PreInstallLogicFunctionApplicationManifest;
  uninstallLogicFunction?: UninstallLogicFunctionApplicationManifest;
  settingsCustomTabFrontComponentUniversalIdentifier?: string;
  packageJsonChecksum: string | null;
  yarnLockChecksum: string | null;
  requiredServerVersionRange?: string | null;
};
