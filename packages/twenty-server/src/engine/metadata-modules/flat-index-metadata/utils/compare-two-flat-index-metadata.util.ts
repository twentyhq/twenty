import diff from 'microdiff';
import { type FromTo } from 'twenty-shared/types';

import { FLAT_INDEX_METADATA_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-index-metadata/constants/flat-index-metadata-properties-to-compare.constant';
import { type FlatIndexMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata-properties-to-compare.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';
import { parseJson } from 'twenty-shared/utils';

export const compareTwoFlatIndexMetadata = ({
  fromFlatIndexMetadata,
  toFlatIndexMetadata,
}: FromTo<FlatIndexMetadata, 'flatIndexMetadata'>) => {
  const transformOptions = {
    propertiesToStringify: ['flatIndexFieldMetadatas'] as const,
    shouldIgnoreProperty: (property: string) =>
      !FLAT_INDEX_METADATA_PROPERTIES_TO_COMPARE.includes(
        property as FlatIndexMetadataPropertiesToCompare,
      ),
  };

  const fromCompare = transformMetadataForComparison(
    fromFlatIndexMetadata,
    transformOptions,
  );
  const toCompare = transformMetadataForComparison(
    toFlatIndexMetadata,
    transformOptions,
  );

  const flatIndexeDifferences = diff(fromCompare, toCompare);

  return flatIndexeDifferences.flatMap<{ property: string } & FromTo<unknown>>(
    (difference) => {
      switch (difference.type) {
        case 'CHANGE': {
          const { oldValue, path, value } = difference;
          const property = path[0] as FlatIndexMetadataPropertiesToCompare;

          if (property === 'flatIndexFieldMetadatas') {
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
        default:
          return [];
      }
    },
  );
};
