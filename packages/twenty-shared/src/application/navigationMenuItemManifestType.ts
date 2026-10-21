import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type NavigationMenuItemType } from '@/types/NavigationMenuItemType';
import { type UniversalConditionalDisplay } from '@/types/conditional-display/UniversalConditionalDisplay';

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
  pageLayoutUniversalIdentifier?: string;
  conditionalDisplay?: UniversalConditionalDisplay;
};
