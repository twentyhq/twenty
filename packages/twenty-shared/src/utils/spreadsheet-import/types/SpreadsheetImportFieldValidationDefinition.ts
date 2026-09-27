import { type SpreadsheetImportErrorLevel } from '@/utils/spreadsheet-import/types/SpreadsheetImportErrorLevel';

export type SpreadsheetImportRequiredValidation<TMessage> = {
  rule: 'required';
  errorMessage: TMessage;
  level?: SpreadsheetImportErrorLevel;
};

export type SpreadsheetImportUniqueValidation<TMessage> = {
  rule: 'unique';
  allowEmpty?: boolean;
  errorMessage: TMessage;
  level?: SpreadsheetImportErrorLevel;
};

export type SpreadsheetImportRegexValidation<TMessage> = {
  rule: 'regex';
  value: string;
  flags?: string;
  errorMessage: TMessage;
  level?: SpreadsheetImportErrorLevel;
};

export type SpreadsheetImportFunctionValidation<TMessage> = {
  rule: 'function';
  isValid: (value: string) => boolean;
  errorMessage: TMessage;
  level?: SpreadsheetImportErrorLevel;
};

export type SpreadsheetImportFieldValidationDefinition<TMessage> =
  | SpreadsheetImportRequiredValidation<TMessage>
  | SpreadsheetImportUniqueValidation<TMessage>
  | SpreadsheetImportRegexValidation<TMessage>
  | SpreadsheetImportFunctionValidation<TMessage>;
