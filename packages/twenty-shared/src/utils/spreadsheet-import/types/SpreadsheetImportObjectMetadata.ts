import { type SpreadsheetImportFieldMetadata } from '@/utils/spreadsheet-import/types/SpreadsheetImportFieldMetadata';

export type SpreadsheetImportObjectMetadata<
  TFieldMetadata extends SpreadsheetImportFieldMetadata =
    SpreadsheetImportFieldMetadata,
> = {
  id: string;
  fields: TFieldMetadata[];
  indexMetadatas: {
    id: string;
    isUnique: boolean;
    indexFieldMetadatas: { fieldMetadataId: string }[];
  }[];
};
