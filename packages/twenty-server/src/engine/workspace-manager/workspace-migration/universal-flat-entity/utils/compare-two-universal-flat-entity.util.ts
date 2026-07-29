import diff from 'microdiff';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { type FromTo } from 'twenty-shared/types';
import { parseJson } from 'twenty-shared/utils';

import { WORKSPACE_CUSTOM_ADOPTABLE_METADATA_NAMES } from 'src/engine/core-modules/application/application-manifest/utils/get-application-scoped-all-flat-entity-maps-for-owner-and-workspace-custom.util';
import { ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY } from 'src/engine/metadata-modules/flat-entity/constant/all-universal-flat-entity-properties-to-compare-and-stringify.constant';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type MetadataUniversalFlatEntityPropertiesToStringify } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-stringify.type';
import { type UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';
import { transformUniversalFlatEntityForComparison } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/transform-universal-flat-entity-for-comparison.util';

type CompareTwoUniversalFlatEntityArgs<T extends AllMetadataName> = FromTo<
  MetadataUniversalFlatEntity<T>,
  'universalFlatEntity'
> & { metadataName: T };

export const compareTwoFlatEntity = <T extends AllMetadataName>({
  fromUniversalFlatEntity,
  toUniversalFlatEntity,
  metadataName,
}: CompareTwoUniversalFlatEntityArgs<T>):
  | UniversalFlatEntityUpdate<T>
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

  // For adoptable metadata types the from-slice may include a workspace-custom
  // entity whose `applicationId` differs from the owner's app. The standard
  // per-entity property config omits `applicationId` (it lives on the flat
  // entity, not the universal one) so a normal diff would miss the ownership
  // transfer. Always include the new `applicationId` in the update payload
  // when the entity is adoptable and the two sides differ.
  if (WORKSPACE_CUSTOM_ADOPTABLE_METADATA_NAMES.includes(metadataName)) {
    const fromAppId = (fromUniversalFlatEntity as { applicationId?: string })
      .applicationId;
    const toAppId = (toUniversalFlatEntity as { applicationId?: string })
      .applicationId;

    if (
      typeof fromAppId === 'string' &&
      typeof toAppId === 'string' &&
      fromAppId !== toAppId
    ) {
      const diffUpdate = flatEntityDifferences.reduce(
        (accumulator, difference) => {
          if (difference.type !== 'CHANGE') {
            return accumulator;
          }
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
        },
        {} as UniversalFlatEntityUpdate<T>,
      );

      return {
        applicationId: toAppId,
        ...diffUpdate,
      } as UniversalFlatEntityUpdate<T>;
    }
  }

  if (flatEntityDifferences.length === 0) {
    return undefined;
  }

  const initialAccumulator: UniversalFlatEntityUpdate<T> = {};

  return flatEntityDifferences.reduce((accumulator, difference) => {
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
};
