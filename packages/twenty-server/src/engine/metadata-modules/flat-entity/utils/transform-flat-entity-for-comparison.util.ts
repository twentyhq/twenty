import { FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { orderObjectProperties } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/order-object-properties.util';

export function transformFlatEntityForComparison<
  TFlatEntity extends FlatEntity,
  PToCompare extends keyof TFlatEntity,
  PJsonB extends keyof TFlatEntity,
>({
  flatEntity,
  options: { propertiesToCompare, propertiesToStringify },
}: {
  flatEntity: TFlatEntity;
  options: {
    propertiesToCompare: PToCompare[];
    propertiesToStringify: PJsonB[];
  };
}) {
  return propertiesToCompare.reduce(
    (flatEntityAccumulator, propertyToCompare) => {
      const currentValue = flatEntity[propertyToCompare];

      if (
        propertiesToStringify.includes(propertyToCompare as unknown as PJsonB)
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
    {} as Pick<TFlatEntity, PToCompare>,
  );
}
