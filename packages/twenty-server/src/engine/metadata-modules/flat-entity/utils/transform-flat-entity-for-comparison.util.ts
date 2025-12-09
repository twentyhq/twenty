import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { orderObjectProperties } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/order-object-properties.util';

export function transformFlatEntityForComparison<
  TFlatEntity extends SyncableFlatEntity,
  PToCompare extends keyof TFlatEntity,
  PJsonB extends PToCompare,
>({
  flatEntity,
  propertiesToCompare,
  propertiesToStringify,
}: {
  flatEntity: TFlatEntity;
  propertiesToCompare: readonly PToCompare[];
  propertiesToStringify: readonly PJsonB[];
}): Pick<TFlatEntity, PToCompare> {
  return propertiesToCompare.reduce(
    (flatEntityAccumulator, propertyToCompare) => {
      const currentValue = flatEntity[propertyToCompare];

      if (propertiesToStringify.includes(propertyToCompare as PJsonB)) {
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
    {} as Pick<TFlatEntity, PToCompare>,
  );
}
