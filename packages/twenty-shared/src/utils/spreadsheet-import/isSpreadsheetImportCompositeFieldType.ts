import { type FieldMetadataType } from '@/types/FieldMetadataType';
import { SPREADSHEET_IMPORT_COMPOSITE_SUB_FIELDS } from '@/utils/spreadsheet-import/constants/SpreadsheetImportCompositeSubFields';

export type SpreadsheetImportCompositeFieldType =
  keyof typeof SPREADSHEET_IMPORT_COMPOSITE_SUB_FIELDS;

export const isSpreadsheetImportCompositeFieldType = (
  type: `${FieldMetadataType}`,
): type is SpreadsheetImportCompositeFieldType =>
  type in SPREADSHEET_IMPORT_COMPOSITE_SUB_FIELDS;
