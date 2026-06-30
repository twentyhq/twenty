import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type PermissionFlagPermissionType = 'settings' | 'tool';

export type PermissionFlagManifest = SyncableEntityOptions & {
  key: string;
  label: string;
  description?: string | null;
  icon?: string | null;
};
