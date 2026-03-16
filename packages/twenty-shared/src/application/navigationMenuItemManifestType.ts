import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type NavigationMenuItemType } from '@/types/NavigationMenuItemType';

export type NavigationMenuItemManifest = SyncableEntityOptions & {
  type: NavigationMenuItemType;
  name?: string;
  icon?: string;
  color?: string;
  position: number;
  viewUniversalIdentifier?: string;
  link?: string;
  folderUniversalIdentifier?: string;
  targetObjectUniversalIdentifier?: string;
};
