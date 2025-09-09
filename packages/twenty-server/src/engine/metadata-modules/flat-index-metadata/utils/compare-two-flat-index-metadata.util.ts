import diff from 'microdiff';
import { type FromTo } from 'twenty-shared/types';
import { parseJson } from 'twenty-shared/utils';

import { FLAT_INDEX_METADATA_JSONB_PROPERTIES } from 'src/engine/metadata-modules/flat-index-metadata/constants/flat-index-metadata-jsonb-properties.constant';
import { FLAT_INDEX_METADATA_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-index-metadata/constants/flat-index-metadata-properties-to-compare.constant';
import { type FlatIndexMetadataJsonbProperties } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata-json-properties.type';
import { type FlatIndexMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata-properties-to-compare.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

export const compareTwoFlatIndexMetadata = ({
  fromFlatIndexMetadata,
  toFlatIndexMetadata,
}: FromTo<FlatIndexMetadata, 'flatIndexMetadata'>) => {
  const transformOptions = {
    shouldIgnoreProperty: (property: string) =>
      !FLAT_INDEX_METADATA_PROPERTIES_TO_COMPARE.includes(
        property as FlatIndexMetadataPropertiesToCompare,
      ),
    propertiesToStringify: FLAT_INDEX_METADATA_JSONB_PROPERTIES,
  };

  const [sortedFromFlatIndexMetadata, sortedToFlatIndexMetadata] = [
    fromFlatIndexMetadata,
    toFlatIndexMetadata,
  ].map((flatIndexMetadata) => ({
    ...flatIndexMetadata,
    flatIndexFieldMetadatas: flatIndexMetadata.flatIndexFieldMetadatas.sort(
      (a, b) => (a.universalIdentifier > b.universalIdentifier ? 1 : -1),
    ),
  }));

  const fromCompare = transformMetadataForComparison(
    sortedFromFlatIndexMetadata,
    transformOptions,
  );
  const toCompare = transformMetadataForComparison(
    sortedToFlatIndexMetadata,
    transformOptions,
  );

  const flatIndexeDifferences = diff(fromCompare, toCompare);

  return flatIndexeDifferences.flatMap<{ property: string } & FromTo<unknown>>(
    (difference) => {
      switch (difference.type) {
        case 'CHANGE': {
          const { oldValue, path, value } = difference;
          const property = path[0] as FlatIndexMetadataPropertiesToCompare;
          const isJsonb = FLAT_INDEX_METADATA_JSONB_PROPERTIES.includes(
            property as FlatIndexMetadataJsonbProperties,
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
        default:
          return [];
      }
    },
  );
};
