import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

// An item under the workspace settings is configured once for everyone, while a
// user item is configured by each member for themselves.
export const SETTINGS_MENU_ITEM_SCOPES = ['WORKSPACE', 'USER'] as const;

export type SettingsMenuItemScope = (typeof SETTINGS_MENU_ITEM_SCOPES)[number];

export const DEFAULT_SETTINGS_MENU_ITEM_SCOPE: SettingsMenuItemScope =
  'WORKSPACE';

export type SettingsMenuItemManifest = SyncableEntityOptions & {
  frontComponentUniversalIdentifier: string;
  title: string;
  icon?: string;
  position?: number;
  scope?: SettingsMenuItemScope;
};
