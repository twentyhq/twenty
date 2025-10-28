import { type AllMetadataName } from 'twenty-shared/metadata';

import { type FlatEntityPropertiesToCompare } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-to-compare.type';
import { type FlatEntityPropertyUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-property-update.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';

export type FlatEntityPropertiesUpdates<
  T extends AllMetadataName,
  K extends FlatEntityPropertiesToCompare<T> = FlatEntityPropertiesToCompare<T>,
> = Array<FlatEntityPropertyUpdate<T, Extract<K, keyof MetadataFlatEntity<T>>>>;
