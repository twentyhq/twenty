import { type HealthCheckLogicFunctionApplicationManifest } from '@/application/healthCheckLogicFunctionApplicationType';
import { type PostInstallLogicFunctionApplicationManifest } from '@/application/postInstallLogicFunctionApplicationType';
import { type PreInstallLogicFunctionApplicationManifest } from '@/application/preInstallLogicFunctionApplicationType';
import { type SettingsFrontComponentApplicationManifest } from '@/application/settingsFrontComponentApplicationType';
import { type UninstallLogicFunctionApplicationManifest } from '@/application/uninstallLogicFunctionApplicationType';
import { type FrontComponentSharedDependenciesManifest } from '@/application/frontComponentSharedDependenciesManifestType';
import { type ApplicationCapability } from '@/application/applicationCapabilityType';
import { type ApplicationOAuthClient } from '@/application/applicationOAuthClientType';
import { type IframeMediaPermission } from '@/types/IframeMediaPermission';
import { type ApplicationBilling } from './applicationBillingType';
import { type ApplicationCategory } from './applicationCategoryType';
import { type ApplicationVariables } from './applicationVariablesType';
import { type ServerVariables } from './server-variables.type';
import { type SyncableEntityOptions } from './syncableEntityOptionsType';

type ApplicationManifestListing = SyncableEntityOptions & {
  displayName: string;
  description: string;
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
  packageJsonChecksum: string;
  yarnLockChecksum: string | null;
  requiredServerVersionRange?: string | null;
};

type ApplicationManifestInstallOptions = {
  requestedCapabilities?: ApplicationCapability[];
  requestedIframeMediaPermissions?: IframeMediaPermission[];
  applicationVariables?: ApplicationVariables;
  billing?: ApplicationBilling;
  serverVariables?: ServerVariables;
  postInstallLogicFunction?: PostInstallLogicFunctionApplicationManifest;
  preInstallLogicFunction?: PreInstallLogicFunctionApplicationManifest;
  uninstallLogicFunction?: UninstallLogicFunctionApplicationManifest;
  healthCheckLogicFunction?: HealthCheckLogicFunctionApplicationManifest;
  settingsFrontComponent?: SettingsFrontComponentApplicationManifest;
  frontComponentSharedDependencies?: FrontComponentSharedDependenciesManifest;
  /**
   * @deprecated Use `defineSettingsFrontComponent()` (exposed on the manifest
   * as `settingsFrontComponent`) instead. This property is ignored.
   */
  settingsCustomTabFrontComponentUniversalIdentifier?: string;
};

export type InstallableApplicationManifest = ApplicationManifestListing &
  ApplicationManifestInstallOptions & {
    defaultRoleUniversalIdentifier: string;
    oAuthClient?: never;
  };

export type OAuthClientApplicationManifest = ApplicationManifestListing & {
  [Key in keyof ApplicationManifestInstallOptions]?: never;
} & {
  oAuthClient: ApplicationOAuthClient;
  defaultRoleUniversalIdentifier?: never;
};

export type ApplicationManifest =
  | InstallableApplicationManifest
  | OAuthClientApplicationManifest;
