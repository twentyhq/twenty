import diff from 'microdiff';
import { type FromTo } from 'twenty-shared/types';

import { FlatFieldMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-properties-to-compare.type';
import { FLAT_INDEX_METADATA_JSONB_PROPERTIES } from 'src/engine/metadata-modules/flat-index-metadata/constants/flat-index-metadata-jsonb-properties.contant';
import { FLAT_INDEX_METADATA_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-index-metadata/constants/flat-index-metadata-properties-to-compare.constant';
import { FlatIndexMetadataJsonbProperties } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata-json-properties.type';
import { FlatIndexMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata-properites-to-compare.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';
import { parseJson } from 'twenty-shared/utils';

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
          const property = path[0] as FlatFieldMetadataPropertiesToCompare;
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
