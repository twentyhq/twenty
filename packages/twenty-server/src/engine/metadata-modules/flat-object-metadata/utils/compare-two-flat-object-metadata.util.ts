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

export const flatObjectMetadataEntityJsonbProperties = [
  'standardOverrides',
] as const satisfies (keyof FlatObjectMetadata)[];
export type FlatObjectMetadataEntityJsonbProperties =
  (typeof flatObjectMetadataEntityJsonbProperties)[number];

/**
 * This comparator handles update on colliding uniqueIdentifier flatObjectMetadata
 */
export const compareTwoFlatObjectMetadata = ({
  from,
  to,
}: FromTo<FlatObjectMetadata>) => {
  const options = {
    propertiesToStringify: flatObjectMetadataEntityJsonbProperties,
    shouldIgnoreProperty: (
      property: string,
      flatObjectMetadata: FlatObjectMetadata,
    ) => {
      if (
        !flatObjectMetadataPropertiesToCompare.includes(
          property as FlatObjectMetadataPropertiesToCompare,
        )
      ) {
        return true;
      }

      const isStandardObject =
        !flatObjectMetadata.isCustom && flatObjectMetadata.standardId !== null;

      if (isStandardObject && property !== 'standardOverrides') {
        return true;
      }

      return false;
    },
  };
  const fromCompare = transformMetadataForComparison(from, options);
  const toCompare = transformMetadataForComparison(to, options);
  const objectMetadataDifference = diff(fromCompare, omit(toCompare, 'fields'));

  return objectMetadataDifference.flatMap<
    UpdateObjectAction['updates'][number]
  >((difference) => {
    switch (difference.type) {
      case 'CHANGE': {
        const { oldValue, path, value } = difference;
        const property = path[0] as FlatObjectMetadataPropertiesToCompare;
        const isJsonb = flatObjectMetadataEntityJsonbProperties.includes(
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
