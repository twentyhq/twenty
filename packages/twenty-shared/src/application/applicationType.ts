import { type ApplicationVariables } from './applicationVariablesType';
import { type ServerVariables } from './server-variables.type';
import { type SyncableEntityOptions } from './syncableEntityOptionsType';
import { type WebhookIngressManifest } from './webhookIngressManifestType';
import { type PostInstallLogicFunctionApplicationManifest } from '@/application/postInstallLogicFunctionApplicationType';
import { type PreInstallLogicFunctionApplicationManifest } from '@/application/preInstallLogicFunctionApplicationType';

export type ApplicationManifest = SyncableEntityOptions & {
  defaultRoleUniversalIdentifier: string;
  displayName: string;
  description: string;
  applicationVariables?: ApplicationVariables;
  serverVariables?: ServerVariables;
  author?: string;
  category?: string;
  logoUrl?: string;
  screenshots?: string[];
  aboutDescription?: string;
  websiteUrl?: string;
  termsUrl?: string;
  emailSupport?: string;
  issueReportUrl?: string;
  postInstallLogicFunction?: PostInstallLogicFunctionApplicationManifest;
  preInstallLogicFunction?: PreInstallLogicFunctionApplicationManifest;
  settingsCustomTabFrontComponentUniversalIdentifier?: string;
  webhookIngress?: WebhookIngressManifest;
  packageJsonChecksum: string | null;
  yarnLockChecksum: string | null;
};
