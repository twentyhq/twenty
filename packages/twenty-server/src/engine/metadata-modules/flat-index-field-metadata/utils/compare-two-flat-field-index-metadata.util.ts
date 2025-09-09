import diff from 'microdiff';
import { type FromTo } from 'twenty-shared/types';

import { FLAT_INDEX_FIELD_METADATA_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-index-field-metadata/constants/flat-index-field-metadata-properties-to-compare.constant';
import { FlatIndexFieldMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-index-field-metadata/types/flat-index-field-metadata-properties-to-compare.type';
import { FlatIndexFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-field-metadata';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

export const compareTwoFlatFieldIndexMetadata = ({
  from,
  to,
}: FromTo<FlatIndexFieldMetadata>) => {
  const transformOptions = {
    shouldIgnoreProperty: (property: string) =>
      !FLAT_INDEX_FIELD_METADATA_PROPERTIES_TO_COMPARE.includes(
        property as FlatIndexFieldMetadataPropertiesToCompare,
      ),
  };

  const fromCompare = transformMetadataForComparison(from, transformOptions);
  const toCompare = transformMetadataForComparison(to, transformOptions);

  const flatIndexeDifferences = diff(fromCompare, toCompare);

  return flatIndexeDifferences.flatMap<{ property: string } & FromTo<unknown>>(
    (difference) => {
      switch (difference.type) {
        case 'CHANGE': {
          const { oldValue, path, value } = difference;

          const property = path[0];

          if (typeof property === 'number') {
            return [];
          }

          return {
            from: oldValue,
            property,
            to: value,
          };
        }
        case 'CREATE':
        case 'REMOVE':
        default:
          return [];
      }
    },
  );
};
