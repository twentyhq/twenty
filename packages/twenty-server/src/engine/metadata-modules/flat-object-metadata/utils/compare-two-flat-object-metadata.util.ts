import omit from 'lodash.omit';
import diff from 'microdiff';
import { type FromTo } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { FLAT_OBJECT_METADATA_JSONB_PROPERTIES } from 'src/engine/metadata-modules/flat-object-metadata/constants/flat-object-metadata-jsonb-properties.constant';
import { FLAT_OBJECT_METADATA_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-object-metadata/constants/flat-object-metadata-properties-to-compare.constant';
import { type FlatObjectMetadataEntityJsonbProperties } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-jsonb-properties.type';
import { type FlatObjectMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-properties-to-compare.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
import { type UpdateObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

export const compareTwoFlatObjectMetadata = ({
  from,
  to,
}: FromTo<FlatObjectMetadata>) => {
  const transformMetadataForComparisonParameters = {
    propertiesToStringify: FLAT_OBJECT_METADATA_JSONB_PROPERTIES,
    shouldIgnoreProperty: (
      property: string,
      flatObjectMetadata: FlatObjectMetadata,
    ) => {
      if (
        !FLAT_OBJECT_METADATA_PROPERTIES_TO_COMPARE.includes(
          property as FlatObjectMetadataPropertiesToCompare,
        )
      ) {
        return true;
      }

      if (
        isStandardMetadata(flatObjectMetadata) &&
        property !== 'standardOverrides'
      ) {
        return true;
      }

      return false;
    },
  };
  const fromCompare = transformMetadataForComparison(
    from,
    transformMetadataForComparisonParameters,
  );
  const toCompare = transformMetadataForComparison(
    to,
    transformMetadataForComparisonParameters,
  );
  const objectMetadataDifference = diff(fromCompare, omit(toCompare, 'fields'));

  return objectMetadataDifference.flatMap<
    UpdateObjectAction['updates'][number]
  >((difference) => {
    switch (difference.type) {
      case 'CHANGE': {
        const { oldValue, path, value } = difference;
        const property = path[0] as FlatObjectMetadataPropertiesToCompare;
        const isJsonb = FLAT_OBJECT_METADATA_JSONB_PROPERTIES.includes(
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
