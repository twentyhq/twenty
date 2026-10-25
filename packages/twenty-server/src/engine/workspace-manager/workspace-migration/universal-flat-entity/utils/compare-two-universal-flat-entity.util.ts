import { isUndefined } from '@sniptt/guards';
import isEqual from 'lodash.isequal';
import diff from 'microdiff';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { type FromTo } from 'twenty-shared/types';
import { parseJson } from 'twenty-shared/utils';

import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY } from 'src/engine/metadata-modules/flat-entity/constant/all-universal-flat-entity-properties-to-compare-and-stringify.constant';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type MetadataUniversalFlatEntityPropertiesToStringify } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-stringify.type';
import { type UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';
import { transformUniversalFlatEntityForComparison } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/transform-universal-flat-entity-for-comparison.util';

type CompareTwoUniversalFlatEntityArgs<T extends AllMetadataName> = FromTo<
  MetadataUniversalFlatEntity<T>,
  'universalFlatEntity'
> & { metadataName: T };

export type UniversalFlatEntityComparison<T extends AllMetadataName> = {
  update: UniversalFlatEntityUpdate<T>;
  nonUpdatablePropertyDivergences: string[];
};

const SERVER_MANAGED_PROPERTIES = new Set(['createdAt', 'updatedAt']);

// An undefined incoming property (removed column, workspace-owned value) is not part of the change
const findNonUpdatablePropertyDivergences = <T extends AllMetadataName>({
  fromUniversalFlatEntity,
  toUniversalFlatEntity,
  metadataName,
}: CompareTwoUniversalFlatEntityArgs<T>): string[] =>
  Object.entries(
    ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[metadataName],
  )
    .filter(
      ([property, { toCompare }]) =>
        !toCompare && !SERVER_MANAGED_PROPERTIES.has(property),
    )
    .map(([property, { universalProperty }]) => universalProperty ?? property)
    .filter((universalProperty) => {
      const key = universalProperty as keyof MetadataUniversalFlatEntity<T>;

      return (
        !isUndefined(toUniversalFlatEntity[key]) &&
        !isEqual(fromUniversalFlatEntity[key], toUniversalFlatEntity[key])
      );
    });

export const compareTwoFlatEntity = <T extends AllMetadataName>({
  fromUniversalFlatEntity,
  toUniversalFlatEntity,
  metadataName,
}: CompareTwoUniversalFlatEntityArgs<T>):
  | UniversalFlatEntityComparison<T>
  | undefined => {
  const { propertiesToStringify, propertiesToCompare } =
    ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY[metadataName];

  const [transformedFromUniversalFlatEntity, transformedToUniversalFlatEntity] =
    [fromUniversalFlatEntity, toUniversalFlatEntity].map(
      (universalFlatEntity) =>
        transformUniversalFlatEntityForComparison({
          metadataName,
          universalFlatEntity,
          propertiesToCompare,
          propertiesToStringify,
        }),
    );

  const flatEntityDifferences = diff(
    transformedFromUniversalFlatEntity,
    transformedToUniversalFlatEntity,
  );

  const nonUpdatablePropertyDivergences = findNonUpdatablePropertyDivergences({
    fromUniversalFlatEntity,
    toUniversalFlatEntity,
    metadataName,
  });

  if (
    flatEntityDifferences.length === 0 &&
    nonUpdatablePropertyDivergences.length === 0
  ) {
    return undefined;
  }

  const initialAccumulator: UniversalFlatEntityUpdate<T> = {};

  const update = flatEntityDifferences.reduce((accumulator, difference) => {
    switch (difference.type) {
      case 'CHANGE': {
        const { path, value } = difference;
        const property = path[0];
        const isJsonb = propertiesToStringify.includes(
          property as MetadataUniversalFlatEntityPropertiesToStringify<T>,
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

  return { update, nonUpdatablePropertyDivergences };
};
