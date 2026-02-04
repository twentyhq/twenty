import { type AllMetadataName } from 'twenty-shared/metadata';

import { type FlatEntityPropertiesToCompare } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-to-compare.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';

export type MetadataFlatEntityComparableProperties<T extends AllMetadataName> =
  Extract<FlatEntityPropertiesToCompare<T>, keyof MetadataFlatEntity<T>>;

export type FlatEntityUpdate<T extends AllMetadataName> = Partial<
  Pick<MetadataFlatEntity<T>, MetadataFlatEntityComparableProperties<T>>
>;
