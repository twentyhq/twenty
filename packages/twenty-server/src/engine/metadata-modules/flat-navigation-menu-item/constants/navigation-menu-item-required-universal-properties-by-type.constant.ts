import { NavigationMenuItemType } from 'twenty-shared/types';

import { type UniversalFlatNavigationMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-navigation-menu-item.type';

// targetRecordId is a workspace record identifier and not a metadata relation,
// it has no universal counterpart
export const NAVIGATION_MENU_ITEM_REQUIRED_UNIVERSAL_PROPERTIES_BY_TYPE = {
  [NavigationMenuItemType.FOLDER]: ['name'],
  [NavigationMenuItemType.OBJECT]: ['targetObjectMetadataUniversalIdentifier'],
  [NavigationMenuItemType.VIEW]: ['viewUniversalIdentifier'],
  [NavigationMenuItemType.RECORD]: [
    'targetRecordId',
    'targetObjectMetadataUniversalIdentifier',
  ],
  [NavigationMenuItemType.LINK]: ['link'],
  [NavigationMenuItemType.PAGE_LAYOUT]: ['pageLayoutUniversalIdentifier'],
} as const satisfies Record<
  NavigationMenuItemType,
  readonly (keyof UniversalFlatNavigationMenuItem)[]
>;
