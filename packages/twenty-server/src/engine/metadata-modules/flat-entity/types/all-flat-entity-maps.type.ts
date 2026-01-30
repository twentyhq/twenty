import { type AllMetadataName } from 'twenty-shared/metadata';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';
import { type FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';

// TODO make field and object maps
export type AllFlatEntityMaps = {
  [P in AllMetadataName as MetadataToFlatEntityMapsKey<P>]: FlatEntityMaps<
    MetadataFlatEntity<P>
  >;
} & {
  flatNavigationMenuItemMaps: FlatNavigationMenuItemMaps;
};
