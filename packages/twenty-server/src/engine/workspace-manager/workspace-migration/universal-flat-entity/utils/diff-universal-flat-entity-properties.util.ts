import { isUndefined } from '@sniptt/guards';
import diff from 'microdiff';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { type FromTo } from 'twenty-shared/types';
import { parseJson } from 'twenty-shared/utils';

import { ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY } from 'src/engine/metadata-modules/flat-entity/constant/all-universal-flat-entity-properties-to-compare-and-stringify.constant';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type MetadataUniversalFlatEntityPropertiesToStringify } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-stringify.type';
import { transformUniversalFlatEntityForComparison } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/transform-universal-flat-entity-for-comparison.util';

// An undefined incoming property (removed column, workspace-owned value) is not part of the change
export const diffUniversalFlatEntityProperties = <T extends AllMetadataName>({
  fromUniversalFlatEntity,
  toUniversalFlatEntity,
  metadataName,
  properties,
}: FromTo<MetadataUniversalFlatEntity<T>, 'universalFlatEntity'> & {
  metadataName: T;
  properties: (keyof MetadataUniversalFlatEntity<T>)[];
}): Partial<MetadataUniversalFlatEntity<T>> => {
  const { propertiesToStringify } =
    ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY[metadataName];

  const [transformedFromUniversalFlatEntity, transformedToUniversalFlatEntity] =
    [fromUniversalFlatEntity, toUniversalFlatEntity].map(
      (universalFlatEntity) =>
        transformUniversalFlatEntityForComparison({
          metadataName,
          universalFlatEntity,
          propertiesToCompare: properties.filter(
            (property) => !isUndefined(toUniversalFlatEntity[property]),
          ),
          propertiesToStringify,
        }) as Record<string, unknown>,
    );

  return diff(
    transformedFromUniversalFlatEntity,
    transformedToUniversalFlatEntity,
  ).reduce((accumulator, { path }) => {
    const property = String(path[0]);
    const value = transformedToUniversalFlatEntity[property];
    const isJsonb = propertiesToStringify.includes(
      property as MetadataUniversalFlatEntityPropertiesToStringify<T>,
    );

    return {
      ...accumulator,
      [property]: isJsonb ? parseJson(value as string) : value,
    };
  }, {});
};
