import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';

export type AllFlatEntityMaps<
  TWithCustomMapsProperties extends boolean = false,
> = {
  [P in AllMetadataName as MetadataToFlatEntityMapsKey<P>]: MetadataFlatEntityMaps<
    P,
    TWithCustomMapsProperties
  >;
};
