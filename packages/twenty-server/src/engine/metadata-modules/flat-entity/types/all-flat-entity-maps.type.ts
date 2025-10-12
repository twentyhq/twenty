import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';

export type AllFlatEntityMaps = {
  [P in keyof AllFlatEntityTypesByMetadataName as MetadataToFlatEntityMapsKey<P>]: FlatEntityMaps<
    MetadataFlatEntity<P>
  >;
};
