import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type NavigationMenuItemManifest = SyncableEntityOptions & {
  name?: string;
  icon?: string;
  color?: string;
  position: number;
  viewUniversalIdentifier?: string;
  link?: string;
  folderUniversalIdentifier?: string;
  targetObjectUniversalIdentifier?: string;
};
