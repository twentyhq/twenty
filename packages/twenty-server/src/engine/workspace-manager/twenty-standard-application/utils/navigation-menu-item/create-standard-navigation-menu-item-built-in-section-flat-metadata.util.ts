import { type BuiltInSectionKey } from 'twenty-shared/types';

import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { createStandardNavigationMenuItemSectionFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/navigation-menu-item/create-standard-navigation-menu-item-section-flat-metadata.util';

export const createStandardNavigationMenuItemBuiltInSectionFlatMetadata = ({
  builtInSectionKey,
  ...args
}: Omit<
  Parameters<typeof createStandardNavigationMenuItemSectionFlatMetadata>[0],
  'name'
> & {
  builtInSectionKey: BuiltInSectionKey;
}): FlatNavigationMenuItem => ({
  ...createStandardNavigationMenuItemSectionFlatMetadata({ ...args, name: '' }),
  name: null,
  builtInSectionKey,
});
