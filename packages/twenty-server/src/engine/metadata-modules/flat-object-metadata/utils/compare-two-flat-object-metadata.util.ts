import omit from 'lodash.omit';
import diff from 'microdiff';
import { type FromTo } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type UpdateObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

export const flatObjectMetadataPropertiesToCompare = [
  'description',
  'icon',
  'isActive',
  'isLabelSyncedWithName',
  'labelPlural',
  'labelSingular',
  'namePlural',
  'nameSingular',
  'standardOverrides', // Only if standard
] as const satisfies (keyof FlatObjectMetadata)[];

export type FlatObjectMetadataPropertiesToCompare =
  (typeof flatObjectMetadataPropertiesToCompare)[number];

export const flatObjectdMetadataEntityJsonbProperties = [
  'standardOverrides',
] as const satisfies (keyof FlatObjectMetadata)[];
export type FlatObjectMetadataEntityJsonbProperties =
  (typeof flatObjectdMetadataEntityJsonbProperties)[number];

/**
 * This comparator handles update on colliding uniqueIdentifier flatObjectMetadata
 */
export const compareTwoFlatObjectMetadata = ({
  from,
  to,
}: FromTo<FlatObjectMetadata>) => {
  const fromCompare = transformMetadataForComparison(from, {
    propertiesToStringify: ['standardOverrides'],
  });
  const toCompare = transformMetadataForComparison(to, {
    propertiesToStringify: ['standardOverrides'],
  });
  const objectMetadataDifference = diff(fromCompare, omit(toCompare, 'fields'));

  return objectMetadataDifference.flatMap<
    UpdateObjectAction['updates'][number]
  >((difference) => {
    switch (difference.type) {
      case 'CHANGE': {
        const { oldValue, path, value } = difference;
        const property = path[0] as FlatObjectMetadataPropertiesToCompare;
        const isJsonb = flatObjectdMetadataEntityJsonbProperties.includes(
          property as FlatObjectMetadataEntityJsonbProperties,
        );

        if (isJsonb) {
          return {
            from: isDefined(oldValue) ? JSON.parse(oldValue) : oldValue,
            to: isDefined(value) ? JSON.parse(value) : value,
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
      case 'REMOVE': {
        // Should never occurs ? should throw ?
        return [];
      }
      default: {
        assertUnreachable(
          difference,
          `Unexpected difference type: ${difference['type']}`,
        );
      }
    }
  });
};
