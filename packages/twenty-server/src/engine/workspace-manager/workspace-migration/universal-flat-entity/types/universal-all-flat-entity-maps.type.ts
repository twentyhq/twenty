import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';

export type UniversalAllFlatEntityMaps = {
  [P in AllMetadataName as MetadataToFlatEntityMapsKey<P>]: FlatEntityMaps<
    AllFlatEntityTypesByMetadataName[P] extends {
      universalMigrated: {
        runner: true;
      };
    }
      ? // Does not make sense in the end
        MetadataUniversalFlatEntity<P>
      : MetadataFlatEntity<P>
  >;
} & {
  flatNavigationMenuItemMaps: FlatNavigationMenuItemMaps;
};
