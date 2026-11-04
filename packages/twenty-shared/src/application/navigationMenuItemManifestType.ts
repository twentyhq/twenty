import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type NavigationMenuItemCommandKey } from '@/types/NavigationMenuItemCommandKey';
import { type NavigationMenuItemType } from '@/types/NavigationMenuItemType';

export type NavigationMenuItemManifest = SyncableEntityOptions & {
  type: NavigationMenuItemType;
  name?: string;
  icon?: string;
  color?: string;
  visibleItemLimit?: number;
  commandKey?: NavigationMenuItemCommandKey;
  position: number;
  viewUniversalIdentifier?: string;
  link?: string;
  folderUniversalIdentifier?: string;
  targetObjectUniversalIdentifier?: string;
  pageLayoutUniversalIdentifier?: string;
};
