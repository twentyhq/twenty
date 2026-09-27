import { COMPOSITE_FIELD_SUB_FIELD_LABELS } from '@/constants/CompositeFieldSubFieldLabels';
import { type FieldLinksVariant } from '@/types/FieldMetadataSettings';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { getUniqueConstraintsFields } from '@/utils/indexMetadata/getUniqueConstraintsFields';
import { SPREADSHEET_IMPORT_COMPOSITE_SUB_FIELDS } from '@/utils/spreadsheet-import/constants/SpreadsheetImportCompositeSubFields';
import { getSpreadsheetImportCompositeSubFieldKey } from '@/utils/spreadsheet-import/getSpreadsheetImportCompositeSubFieldKey';
import { getSpreadsheetImportLinksVariant } from '@/utils/spreadsheet-import/getSpreadsheetImportLinksVariant';
import { isSpreadsheetImportCompositeFieldType } from '@/utils/spreadsheet-import/isSpreadsheetImportCompositeFieldType';
import { type ImportedStructuredRow } from '@/utils/spreadsheet-import/types/ImportedStructuredRow';
import { type SpreadsheetImportFieldMetadata } from '@/utils/spreadsheet-import/types/SpreadsheetImportFieldMetadata';
import { type SpreadsheetImportObjectMetadata } from '@/utils/spreadsheet-import/types/SpreadsheetImportObjectMetadata';
import { getLinkUrlNormalizer } from '@/utils/url/getLinkUrlNormalizer';

export type SpreadsheetImportUniqueConstraintColumn = {
  columnName: string;
  fieldType: `${FieldMetadataType}`;
  linksVariant?: FieldLinksVariant;
};

export const getSpreadsheetImportUniqueConstraints = (
  objectMetadataItem: SpreadsheetImportObjectMetadata,
): SpreadsheetImportUniqueConstraintColumn[][] =>
  getUniqueConstraintsFields<
    SpreadsheetImportFieldMetadata,
    SpreadsheetImportObjectMetadata
  >(objectMetadataItem).map((uniqueConstraintFields) =>
    uniqueConstraintFields.flatMap((field) => {
      if (!isSpreadsheetImportCompositeFieldType(field.type)) {
        return [{ columnName: field.name, fieldType: field.type }];
      }

      return SPREADSHEET_IMPORT_COMPOSITE_SUB_FIELDS[field.type]
        .filter(
          ({ isIncludedInUniqueConstraint }) => isIncludedInUniqueConstraint,
        )
        .map(({ subFieldName }) => ({
          columnName: getSpreadsheetImportCompositeSubFieldKey(
            field,
            subFieldName,
          ),
          fieldType: field.type,
          linksVariant: getSpreadsheetImportLinksVariant(field),
        }));
    }),
  );

// Normalized like the server does before its own unique check, so rows that
// would collide in the database are flagged before import.
export const getSpreadsheetImportUniqueValue = (
  row: ImportedStructuredRow,
  uniqueConstraint: SpreadsheetImportUniqueConstraintColumn[],
) =>
  uniqueConstraint
    .map(({ columnName, fieldType, linksVariant }) => {
      if (
        fieldType === FieldMetadataType.LINKS &&
        columnName.includes(
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.LINKS]
            .primaryLinkUrl,
        )
      ) {
        const rawPrimaryLinkUrl = row?.[columnName]?.toString().trim() || '';

        return getLinkUrlNormalizer(linksVariant)(rawPrimaryLinkUrl);
      }

      return row?.[columnName]?.toString().trim().toLowerCase();
    })
    .join('');
