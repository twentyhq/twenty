import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';

export type FlatNavigationMenuItemMaps =
  FlatEntityMaps<FlatNavigationMenuItem> & {
    byUserWorkspaceIdAndFolderId: Partial<
      Record<string, Partial<Record<string, FlatNavigationMenuItem[]>>>
    >;
  };
