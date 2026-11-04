import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type NavigationMenuItemType } from '@/types/NavigationMenuItemType';
import { type NativePageKey } from '@/types/NativePageKey';

export type NavigationMenuItemManifest = SyncableEntityOptions & {
  type: NavigationMenuItemType;
  name?: string;
  icon?: string;
  color?: string;
  position: number;
  viewUniversalIdentifier?: string;
  link?: string;
  nativePageKey?: NativePageKey;
  folderUniversalIdentifier?: string;
  targetObjectUniversalIdentifier?: string;
  pageLayoutUniversalIdentifier?: string;
};
