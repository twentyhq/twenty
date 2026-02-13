import { type NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatNavigationMenuItem = UniversalFlatEntityFrom<
  NavigationMenuItemEntity,
  'navigationMenuItem'
>;
