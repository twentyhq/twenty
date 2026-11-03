import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type NavigationMenuItemType } from '@/types/NavigationMenuItemType';
import { type SystemPageKey } from '@/types/SystemPageKey';

export type NavigationMenuItemManifest = SyncableEntityOptions & {
  type: NavigationMenuItemType;
  name?: string;
  icon?: string;
  color?: string;
  position: number;
  viewUniversalIdentifier?: string;
  link?: string;
  systemPageKey?: SystemPageKey;
  folderUniversalIdentifier?: string;
  targetObjectUniversalIdentifier?: string;
  pageLayoutUniversalIdentifier?: string;
};
