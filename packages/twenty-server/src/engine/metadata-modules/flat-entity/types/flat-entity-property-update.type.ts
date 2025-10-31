import { type AllMetadataName } from 'twenty-shared/metadata';

import { type FlatEntityPropertiesToCompare } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-to-compare.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';

export type FlatEntityPropertyUpdate<
  T extends AllMetadataName,
  K extends FlatEntityPropertiesToCompare<T> = FlatEntityPropertiesToCompare<T>,
> = PropertyUpdate<
  MetadataFlatEntity<T>,
  Extract<K, keyof MetadataFlatEntity<T>>
>;
