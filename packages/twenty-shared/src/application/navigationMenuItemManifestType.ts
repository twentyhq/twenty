import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type BuiltInSectionKey } from '@/types/BuiltInSectionKey';
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
  builtInSectionKey?: BuiltInSectionKey;
  parentUniversalIdentifier?: string;
  // TODO(@thomtrp): remove once published apps no longer send it, along with normalizeNavigationMenuItemManifest
  /** @deprecated Use parentUniversalIdentifier instead. */
  folderUniversalIdentifier?: string;
  targetObjectUniversalIdentifier?: string;
  pageLayoutUniversalIdentifier?: string;
};
