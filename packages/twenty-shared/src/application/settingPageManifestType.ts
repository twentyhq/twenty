import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

// A page rendered under the workspace settings is configured once for everyone,
// while a workspace member page is configured by each member for themselves.
export const SETTING_PAGE_SCOPES = ['WORKSPACE', 'WORKSPACE_MEMBER'] as const;

export type SettingPageScope = (typeof SETTING_PAGE_SCOPES)[number];

export const DEFAULT_SETTING_PAGE_SCOPE: SettingPageScope = 'WORKSPACE';

export type SettingPageManifest = SyncableEntityOptions & {
  frontComponentUniversalIdentifier: string;
  title: string;
  icon?: string;
  position?: number;
  scope?: SettingPageScope;
};
