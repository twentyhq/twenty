import { type AllMetadataName } from 'twenty-shared/metadata';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';

export type MetadataFlatEntityMaps<T extends AllMetadataName> = FlatEntityMaps<
  MetadataFlatEntity<T>
>;
