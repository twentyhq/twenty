import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { orderObjectProperties } from 'src/engine/metadata-modules/flat-entity/utils/order-object-properties.util';
import { type MetadataUniversalFlatEntityPropertiesToCompare } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-compare.type';
import { type MetadataUniversalFlatEntityPropertiesToStringify } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-stringify.type';

export function transformUniversalFlatEntityForComparison<
  T extends AllMetadataName,
>({
  universalFlatEntity,
  propertiesToCompare,
  propertiesToStringify,
}: {
  universalFlatEntity: MetadataUniversalFlatEntity<T>;
  propertiesToCompare: MetadataUniversalFlatEntityPropertiesToCompare<T>[];
  propertiesToStringify: MetadataUniversalFlatEntityPropertiesToStringify<T>[];
}) {
  return propertiesToCompare.reduce(
    (flatEntityAccumulator, propertyToCompare) => {
      const currentValue = universalFlatEntity[propertyToCompare];

      if (
        propertiesToStringify.includes(
          propertyToCompare as string as MetadataUniversalFlatEntityPropertiesToStringify<T>,
        )
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
    {},
  );
}
