import diff from 'microdiff';
import { type FromTo } from 'twenty-shared/types';
import { isDefined, parseJson } from 'twenty-shared/utils';

import { FLAT_FIELD_METADATA_JSONB_PROPERTIES } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-jsonb-properties.constant';
import { FLAT_FIELD_METADATA_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-properties-to-compare.constant';
import { FLAT_FIELD_METADATA_RELATION_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-relation-properties-to-compare.constant';
import { type FlatFieldMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-properties-to-compare.type';
import { type FlatFieldMetadataRelationPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-relation-properties-to-compare.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataJsonbProperty } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-jsonb-property.util';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { type UpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

type GetWorkspaceMigrationUpdateFieldActionArgs = FromTo<
  FlatFieldMetadata,
  'FlatFieldMetadata'
>;
/**
 * This comparator handles update on colliding uniqueIdentifier flatFieldMetadata
 */
export const compareTwoFlatFieldMetadata = ({
  fromFlatFieldMetadata,
  toFlatFieldMetadata,
}: GetWorkspaceMigrationUpdateFieldActionArgs) => {
  const transformMetadataForComparisonParameters = {
    shouldIgnoreProperty: (
      property: string,
      fieldMetadata: FlatFieldMetadata,
    ) => {
      if (
        !FLAT_FIELD_METADATA_PROPERTIES_TO_COMPARE.includes(
          property as FlatFieldMetadataPropertiesToCompare,
        )
      ) {
        return true;
      }

      // Remove below assertion when we authorize relation edition, see https://github.com/twentyhq/twenty/commit/39f6f3c4bb101272a9014e142a842d0801a3c33b
      const isMorphOrRelationFieldType =
        isDefined(fieldMetadata.type) &&
        isMorphOrRelationFieldMetadataType(fieldMetadata.type);

      if (
        isMorphOrRelationFieldType &&
        !FLAT_FIELD_METADATA_RELATION_PROPERTIES_TO_COMPARE.includes(
          property as FlatFieldMetadataRelationPropertiesToCompare,
        )
      ) {
        return true;
      }

      if (
        isStandardMetadata(fieldMetadata) &&
        property !== 'standardOverrides'
      ) {
        return true;
      }

      return false;
    },
    propertiesToStringify: FLAT_FIELD_METADATA_JSONB_PROPERTIES,
  };
  const fromCompare = transformMetadataForComparison(
    fromFlatFieldMetadata,
    transformMetadataForComparisonParameters,
  );
  const toCompare = transformMetadataForComparison(
    toFlatFieldMetadata,
    transformMetadataForComparisonParameters,
  );

  const flatFieldMetadataDifferences = diff(fromCompare, toCompare);

  return flatFieldMetadataDifferences.flatMap<
    UpdateFieldAction['updates'][number]
  >((difference) => {
    switch (difference.type) {
      case 'CHANGE': {
        const { oldValue, path, value } = difference;
        const property = path[0] as FlatFieldMetadataPropertiesToCompare;
        const isJsonb = isFlatFieldMetadataJsonbProperty({
          flatFieldMetadata: toFlatFieldMetadata,
          property,
        });

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
      default: {
        // Should never occurs, we should only provide null never undefined and so on
        return [];
      }
    }
  });
};
