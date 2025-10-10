import {
  AllFlatEntityConfigurationByMetadataName,
  AllMetadataName,
  MetadataFlatEntity,
} from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { orderObjectProperties } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/order-object-properties.util';

export type transformFlatEntityForComparisonArgs<T extends AllMetadataName> =
  Pick<
    AllFlatEntityConfigurationByMetadataName[T]['configuration'],
    'propertiesToCompare' | 'propertiesToStringify'
  > & { flatEntity: MetadataFlatEntity<T> };

export function transformFlatEntityForComparison<T extends AllMetadataName>({
  flatEntity,
  propertiesToCompare,
  propertiesToStringify,
}: transformFlatEntityForComparisonArgs<T>) {
  return propertiesToCompare.reduce(
    (flatEntityAccumulator, propertyToCompare) => {
      const currentValue = flatEntity[propertyToCompare];

      if (
        // @ts-expect-error TODO prastoin
        propertiesToStringify.includes(propertyToCompare)
      ) {
        const orderedValue = orderObjectProperties(currentValue);

        return {
          ...flatEntityAccumulator,
          [propertyToCompare]: JSON.stringify(orderedValue),
        };
      }

      return {
        ...flatEntityAccumulator,
        [propertyToCompare]: currentValue,
      };
    },
    {} as Pick<
      MetadataFlatEntity<T>,
      AllFlatEntityConfigurationByMetadataName[T]['configuration']['propertiesToCompare']
    >,
  );
}
