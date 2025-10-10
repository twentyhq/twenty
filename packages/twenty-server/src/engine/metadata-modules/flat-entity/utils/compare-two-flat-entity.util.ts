import diff from 'microdiff';
import { parseJson } from 'twenty-shared/utils';

import {
  AllFlatEntityConfigurationByMetadataName,
  AllMetadataName,
  MetadataFlatEntity,
} from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { transformFlatEntityForComparison } from 'src/engine/metadata-modules/flat-entity/utils/transform-flat-entity-for-comparison.util';
import { type PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';
import { FromTo } from 'twenty-shared/types';

export type CompareTwoFlatEntityArgs<T extends AllMetadataName> = Pick<
  AllFlatEntityConfigurationByMetadataName[T]['configuration'],
  'propertiesToCompare' | 'propertiesToStringify'
> &
  FromTo<MetadataFlatEntity<T>, 'flatEntity'>;

export const compareTwoFlatEntity = <T extends AllMetadataName>({
  fromFlatEntity,
  toFlatEntity,
  propertiesToCompare,
  propertiesToStringify,
}: CompareTwoFlatEntityArgs<T>) => {
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

  return flatEntityDifferences.flatMap<
    Array<
      {
        [P in PToCompare]: PropertyUpdate<TFlatEntity, P>;
      }[PToCompare]
    >[number]
  >((difference) => {
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
  });
};
