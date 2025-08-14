import diff from 'microdiff';
import { FieldMetadataType, type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FLAT_FIELD_METADATA_JSONB_PROPERTIES } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-jsonb-properties.constant';
import { FLAT_FIELD_METADATA_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-properties-to-compare.constant';
import { FLAT_FIELD_METADATA_RELATION_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-relation-properties-to-compare.constant';
import { type FlatFieldMetadataEntityJsonbProperties } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-jsonb-properties.type';
import { type FlatFieldMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-properties-to-compare.type';
import { type FlatFieldMetadataRelationPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-relation-properties-to-compare.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
import { type UpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

const shouldNotOverrideDefaultValue = (type: FieldMetadataType) => {
  return [
    FieldMetadataType.BOOLEAN,
    FieldMetadataType.SELECT,
    FieldMetadataType.MULTI_SELECT,
    FieldMetadataType.CURRENCY,
    FieldMetadataType.PHONES,
    FieldMetadataType.ADDRESS,
  ].includes(type);
};

type GetWorkspaceMigrationUpdateFieldActionArgs = FromTo<FlatFieldMetadata>;
/**
 * This comparator handles update on colliding uniqueIdentifier flatFieldMetadata
 */
export const compareTwoFlatFieldMetadata = ({
  from,
  to,
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

      if (
        property === 'defaultValue' &&
        isDefined(fieldMetadata.type) &&
        shouldNotOverrideDefaultValue(fieldMetadata.type)
      ) {
        return true;
      }

      // Remove below assertion when we authorize relation edition, see https://github.com/twentyhq/twenty/commit/39f6f3c4bb101272a9014e142a842d0801a3c33b
      const isRelationFieldType =
        isDefined(fieldMetadata.type) &&
        (fieldMetadata.type === FieldMetadataType.RELATION ||
          fieldMetadata.type === FieldMetadataType.MORPH_RELATION);

      if (
        isRelationFieldType &&
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
    from,
    transformMetadataForComparisonParameters,
  );
  const toCompare = transformMetadataForComparison(
    to,
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
        const isJsonb = FLAT_FIELD_METADATA_JSONB_PROPERTIES.includes(
          property as FlatFieldMetadataEntityJsonbProperties,
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
      case 'REMOVE':
      default: {
        // Should never occurs, we should only provide null never undefined and so on
        return [];
      }
    }
  });
};
