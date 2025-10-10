import diff from 'microdiff';
import { type FromTo } from 'twenty-shared/types';
import { parseJson } from 'twenty-shared/utils';

import { ALL_FLAT_ENTITY_CONFIGURATION } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-configuration.constant';
import {
  FlatEntityPropertiesUpdates,
  MetadataFlatEntity,
} from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { transformFlatEntityForComparison } from 'src/engine/metadata-modules/flat-entity/utils/transform-flat-entity-for-comparison.util';

export const compareTwoFlatEntity = <
  T extends AllMetadataName,
  PToCompare extends Extract<
    (typeof ALL_FLAT_ENTITY_CONFIGURATION)[T]['propertiesToCompare'][number],
    keyof MetadataFlatEntity<T>
  >,
  PJsonB extends PToCompare = PToCompare,
>({
  fromFlatEntity,
  toFlatEntity,
  propertiesToCompare,
  propertiesToStringify,
}: FromTo<MetadataFlatEntity<T>, 'flatEntity'> & {
  propertiesToCompare: readonly PToCompare[];
  propertiesToStringify: readonly PJsonB[];
}): FlatEntityPropertiesUpdates<T> => {
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

  return flatEntityDifferences.flatMap<FlatEntityPropertiesUpdates<T>[number]>(
    (difference) => {
      switch (difference.type) {
        case 'CHANGE': {
          const { oldValue, path, value } = difference;
          const property = path[0] as PToCompare;
          const isJsonb = propertiesToStringify.includes(
            property as unknown as PJsonB,
          );

          if (isJsonb) {
            return {
              from: parseJson(oldValue),
              to: parseJson(value),
              property,
            };
          }

          return {
            from: oldValue,
            to: value,
            property,
          };
        }
        case 'CREATE':
        case 'REMOVE':
        default: {
          // Should never occurs, we should only provide null never undefined and so on
          return [];
        }
      }
    },
  );
};
