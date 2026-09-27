import { type ImportedStructuredRow } from '@/utils/spreadsheet-import/types/ImportedStructuredRow';
import { type SpreadsheetImportCellError } from '@/utils/spreadsheet-import/types/SpreadsheetImportRowErrors';

export type SpreadsheetImportAddError<TMessage> = (
  rowIndex: number,
  fieldKey: string,
  error: SpreadsheetImportCellError<TMessage>,
) => void;

export type SpreadsheetImportTableHook<TMessage> = (
  table: ImportedStructuredRow[],
  addError: SpreadsheetImportAddError<TMessage>,
) => ImportedStructuredRow[];

export type SpreadsheetImportRowHook<TMessage> = (
  row: ImportedStructuredRow,
  addError: (
    fieldKey: string,
    error: SpreadsheetImportCellError<TMessage>,
  ) => void,
  table: ImportedStructuredRow[],
) => ImportedStructuredRow;
