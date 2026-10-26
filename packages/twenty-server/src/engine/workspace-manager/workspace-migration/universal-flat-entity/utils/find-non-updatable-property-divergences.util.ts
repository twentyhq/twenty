import { isUndefined } from '@sniptt/guards';
import diff from 'microdiff';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { type FromTo } from 'twenty-shared/types';

import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type MetadataUniversalFlatEntityPropertiesToStringify } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-stringify.type';
import { transformUniversalFlatEntityForComparison } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/transform-universal-flat-entity-for-comparison.util';

const SERVER_MANAGED_PROPERTIES = new Set(['createdAt', 'updatedAt']);

// An undefined incoming property (removed column, workspace-owned value) is not part of the change
export const findNonUpdatablePropertyDivergences = <T extends AllMetadataName>({
  fromUniversalFlatEntity,
  toUniversalFlatEntity,
  metadataName,
}: FromTo<MetadataUniversalFlatEntity<T>, 'universalFlatEntity'> & {
  metadataName: T;
}): string[] => {
  const nonComparableProperties = Object.entries(
    ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[metadataName],
  )
    .filter(
      ([property, { toCompare }]) =>
        !toCompare && !SERVER_MANAGED_PROPERTIES.has(property),
    )
    .map(([property, { universalProperty, toStringify }]) => ({
      universalProperty: (universalProperty ??
        property) as keyof MetadataUniversalFlatEntity<T>,
      toStringify,
    }))
    .filter(
      ({ universalProperty }) =>
        !isUndefined(toUniversalFlatEntity[universalProperty]),
    );

  const propertiesToCompare = nonComparableProperties.map(
    ({ universalProperty }) => universalProperty,
  );
  const propertiesToStringify = nonComparableProperties
    .filter(({ toStringify }) => toStringify)
    .map(
      ({ universalProperty }) =>
        universalProperty as MetadataUniversalFlatEntityPropertiesToStringify<T>,
    );

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

  return [
    ...new Set(
      diff(
        transformedFromUniversalFlatEntity,
        transformedToUniversalFlatEntity,
      ).map(({ path }) => String(path[0])),
    ),
  ];
};
