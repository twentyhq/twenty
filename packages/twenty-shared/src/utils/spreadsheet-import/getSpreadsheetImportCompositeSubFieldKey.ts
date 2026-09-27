import { COMPOSITE_FIELD_SUB_FIELD_LABELS } from '@/constants/CompositeFieldSubFieldLabels';
import { type SpreadsheetImportFieldMetadata } from '@/utils/spreadsheet-import/types/SpreadsheetImportFieldMetadata';
import { isSpreadsheetImportCompositeFieldType } from '@/utils/spreadsheet-import/isSpreadsheetImportCompositeFieldType';

export const getSpreadsheetImportCompositeSubFieldKey = (
  fieldMetadataItem: Pick<SpreadsheetImportFieldMetadata, 'name' | 'type'>,
  subFieldName: string,
) => {
  if (!isSpreadsheetImportCompositeFieldType(fieldMetadataItem.type)) {
    throw new Error(
      `getSpreadsheetImportCompositeSubFieldKey can only be called for composite field types. Received: ${fieldMetadataItem.type}`,
    );
  }

  const subFieldLabel =
    COMPOSITE_FIELD_SUB_FIELD_LABELS[fieldMetadataItem.type][subFieldName];

  return `${subFieldLabel} (${fieldMetadataItem.name})`;
};
