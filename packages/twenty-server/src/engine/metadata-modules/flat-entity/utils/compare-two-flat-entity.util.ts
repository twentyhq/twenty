import diff from 'microdiff';
import { type FromTo } from 'twenty-shared/types';
import { parseJson } from 'twenty-shared/utils';

import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { transformFlatEntityForComparison } from 'src/engine/metadata-modules/flat-entity/utils/transform-flat-entity-for-comparison.util';
import { type PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';

export type CompareTwoFlatEntityArgs<
  TFlatEntity extends FlatEntity,
  PToCompare extends keyof TFlatEntity,
  PJsonB extends PToCompare,
> = FromTo<TFlatEntity, 'flatEntity'> & {
  propertiesToCompare: readonly PToCompare[];
  propertiesToStringify: readonly PJsonB[];
};

export const compareTwoFlatEntity = <
  TFlatEntity extends FlatEntity,
  PToCompare extends keyof TFlatEntity,
  PJsonB extends PToCompare,
>({
  fromFlatEntity,
  toFlatEntity,
  propertiesToCompare,
  propertiesToStringify,
}: CompareTwoFlatEntityArgs<TFlatEntity, PToCompare, PJsonB>) => {
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
