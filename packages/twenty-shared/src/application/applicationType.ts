import { type PostInstallLogicFunctionApplicationManifest } from '@/application/postInstallLogicFunctionApplicationType';
import { type PreInstallLogicFunctionApplicationManifest } from '@/application/preInstallLogicFunctionApplicationType';
import { type SettingsFrontComponentApplicationManifest } from '@/application/settingsFrontComponentApplicationType';
import { type UninstallLogicFunctionApplicationManifest } from '@/application/uninstallLogicFunctionApplicationType';
import { type ApplicationCategory } from './applicationCategoryType';
import { type ApplicationVariables } from './applicationVariablesType';
import { type ServerVariables } from './server-variables.type';
import { type SyncableEntityOptions } from './syncableEntityOptionsType';

export type ApplicationManifest = SyncableEntityOptions & {
  defaultRoleUniversalIdentifier: string;
  displayName: string;
  description: string;
  /**
   * Whether the application needs to act with no user behind it, as the
   * workspace itself, for cron triggers and other unattended work. Defaults to
   * false: an application that only ever acts for a person does not need it.
   */
  canActWithoutUser?: boolean;
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
  settingsFrontComponent?: SettingsFrontComponentApplicationManifest;
  /**
   * @deprecated Use `defineSettingsFrontComponent()` (exposed on the manifest
   * as `settingsFrontComponent`) instead. This property is ignored.
   */
  settingsCustomTabFrontComponentUniversalIdentifier?: string;
  packageJsonChecksum: string | null;
  yarnLockChecksum: string | null;
  requiredServerVersionRange?: string | null;
};
