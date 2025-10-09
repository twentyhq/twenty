import { type AllFlatEntitiesByMetadataEngineName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FromMetadataEngineNameToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-engine-name-to-flat-entity-maps-key.type';

export type AllFlatEntityMaps = {
  [P in keyof AllFlatEntitiesByMetadataEngineName as FromMetadataEngineNameToFlatEntityMapsKey<P>]: FlatEntityMaps<
    AllFlatEntitiesByMetadataEngineName[P]
  >;
};
