import { type AllMetadataName } from 'twenty-shared/metadata';

import { type FlatEntityPropertiesToCompare } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-to-compare.type';
import { MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type UniversalFlatEntityPropertyUpdate } from 'src/engine/metadata-modules/flat-entity/types/universal-flat-entity-property-update.type';

export type UniversalFlatEntityPropertiesUpdates<
  T extends AllMetadataName,
  K extends FlatEntityPropertiesToCompare<T> = FlatEntityPropertiesToCompare<T>,
> = Array<UniversalFlatEntityPropertyUpdate<T, Extract<K, keyof MetadataUniversalFlatEntity<T>>>>;
