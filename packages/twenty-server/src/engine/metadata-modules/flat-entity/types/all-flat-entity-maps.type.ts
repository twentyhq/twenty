import { type AllFlatEntityConfigurationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-configuration-by-metadata-name.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FromMetadataNameToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-name-to-flat-entity-maps-key.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';

export type AllFlatEntityMaps = {
  [P in keyof AllFlatEntityConfigurationByMetadataName as FromMetadataNameToFlatEntityMapsKey<P>]: FlatEntityMaps<
    MetadataFlatEntity<P>
  >;
};
