import diff from 'microdiff';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { type FromTo } from 'twenty-shared/types';
import { parseJson } from 'twenty-shared/utils';

import { type FlatEntityPropertiesToCompare } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-to-compare.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { transformFlatEntityForComparison } from 'src/engine/metadata-modules/flat-entity/utils/transform-flat-entity-for-comparison.util';
import { type UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';

export const compareTwoFlatEntity = <
  T extends AllMetadataName,
  PToCompare extends Extract<
    FlatEntityPropertiesToCompare<T>,
    keyof MetadataUniversalFlatEntity<T>
  >,
  PJsonB extends PToCompare = PToCompare,
>({
  fromFlatEntity,
  toFlatEntity,
  propertiesToCompare,
  propertiesToStringify,
}: FromTo<MetadataUniversalFlatEntity<T>, 'flatEntity'> & {
  propertiesToCompare: readonly PToCompare[];
  propertiesToStringify: readonly PJsonB[];
}): UniversalFlatEntityUpdate<T> | undefined => {
  const [transformedFromFlatEntity, transformedToFlatEntity] = [
    fromFlatEntity,
    toFlatEntity,
  ].map((flatEntity) =>
    transformFlatEntityForComparison({
      flatEntity,
      propertiesToCompare,
      propertiesToStringify,
    }),
  );

  const flatEntityDifferences = diff(
    transformedFromFlatEntity,
    transformedToFlatEntity,
  );

  if (flatEntityDifferences.length === 0) {
    return undefined;
  }

  const initialAccumulator: UniversalFlatEntityUpdate<T> = {};

  return flatEntityDifferences.reduce((accumulator, difference) => {
    switch (difference.type) {
      case 'CHANGE': {
        const { path, value } = difference;
        const property = path[0] as PToCompare;
        const isJsonb = propertiesToStringify.includes(
          property as unknown as PJsonB,
        );

        if (isJsonb) {
          return {
            ...accumulator,
            [property]: parseJson(value),
          };
        }

        return {
          ...accumulator,
          [property]: value,
        };
      }
      case 'CREATE':
      case 'REMOVE':
      default: {
        // Should never occur, we should only provide null never undefined and so on
        return accumulator;
      }
    }
  }, initialAccumulator);
};
