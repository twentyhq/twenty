import { type BuiltInSectionKey } from 'twenty-shared/types';

import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';
import { createStandardNavigationMenuItemFolderFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/navigation-menu-item/create-standard-navigation-menu-item-folder-flat-metadata.util';

export const createStandardNavigationMenuItemSectionFlatMetadata = ({
  builtInSectionKey = null,
  visibleItemLimit = null,
  ...args
}: Omit<
  Parameters<typeof createStandardNavigationMenuItemFolderFlatMetadata>[0],
  'color'
> & {
  builtInSectionKey?: BuiltInSectionKey | null;
  visibleItemLimit?: number | null;
}): FlatNavigationMenuItem => ({
  ...createStandardNavigationMenuItemFolderFlatMetadata({
    ...args,
    color: null,
  }),
  type: NavigationMenuItemType.SECTION,
  builtInSectionKey,
  visibleItemLimit,
});
