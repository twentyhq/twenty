import { type SpreadsheetImportErrorLevel } from '@/utils/spreadsheet-import/types/SpreadsheetImportErrorLevel';

export type SpreadsheetImportCellError<TMessage> = {
  message: TMessage;
  level: SpreadsheetImportErrorLevel;
};

export type SpreadsheetImportRowErrors<TMessage> = Record<
  string,
  SpreadsheetImportCellError<TMessage>
>;

export type SpreadsheetImportErrorsByRowIndex<TMessage> = Record<
  number,
  SpreadsheetImportRowErrors<TMessage>
>;
