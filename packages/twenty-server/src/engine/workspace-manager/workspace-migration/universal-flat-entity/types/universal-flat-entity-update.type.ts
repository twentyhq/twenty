import { type AllMetadataName } from 'twenty-shared/metadata';

import { type FlatEntityPropertiesToCompare } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-to-compare.type';
import { MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

export type MetadataUniversalFlatEntityComparableProperties<T extends AllMetadataName> =
  Extract<FlatEntityPropertiesToCompare<T>, keyof MetadataUniversalFlatEntity<T>>;

export type UniversalFlatEntityUpdate<T extends AllMetadataName> = Partial<
  Pick<MetadataUniversalFlatEntity<T>, MetadataUniversalFlatEntityComparableProperties<T>>
>;
