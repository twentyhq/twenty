import diff from 'microdiff';
import { FieldMetadataType, type FromTo } from 'twenty-shared/types';
import { isDefined, parseJson } from 'twenty-shared/utils';

import { FLAT_FIELD_METADATA_JSONB_PROPERTIES } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-jsonb-properties.constant';
import { FLAT_FIELD_METADATA_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-properties-to-compare.constant';
import { FLAT_FIELD_METADATA_RELATION_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-relation-properties-to-compare.constant';
import { type FlatFieldMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-properties-to-compare.type';
import { type FlatFieldMetadataRelationPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-relation-properties-to-compare.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const from = parseJson<any>(oldValue);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const to = parseJson<any>(value);

        return {
          from,
          to,
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
