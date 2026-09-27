import { type FieldMetadataType } from '@/types/FieldMetadataType';
import { type SpreadsheetImportFieldMetadata } from '@/utils/spreadsheet-import/types/SpreadsheetImportFieldMetadata';
import { type SpreadsheetImportFieldType } from '@/utils/spreadsheet-import/types/SpreadsheetImportFieldType';
import { type SpreadsheetImportFieldValidationDefinition } from '@/utils/spreadsheet-import/types/SpreadsheetImportFieldValidationDefinition';
import { type SpreadsheetImportValidationMessage } from '@/utils/spreadsheet-import/types/SpreadsheetImportValidationMessage';

export type SpreadsheetImportFieldDescriptor<
  TFieldMetadata extends SpreadsheetImportFieldMetadata =
    SpreadsheetImportFieldMetadata,
> = {
  label: string;
  key: string;
  // Same for all nested fields built from one field metadata item
  fieldMetadataItemId: string;
  fieldValidationDefinitions: SpreadsheetImportFieldValidationDefinition<SpreadsheetImportValidationMessage>[];
  fieldType: SpreadsheetImportFieldType;
  fieldMetadataType: FieldMetadataType;
  // True for composite sub-fields and relation connect fields
  isNestedField: boolean;
  isCompositeSubField?: boolean;
  compositeSubFieldKey?: string;
  isRelationConnectField?: boolean;
  uniqueFieldMetadataItem?: TFieldMetadata;
};
