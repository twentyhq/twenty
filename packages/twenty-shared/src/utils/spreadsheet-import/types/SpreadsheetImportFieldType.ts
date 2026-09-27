export type SpreadsheetImportSelectOption = {
  label: string;
  value: string;
  color?: string | null;
};

export type SpreadsheetImportFieldType =
  | {
      type: 'checkbox';
      // Alternate values to be treated as booleans, e.g. {yes: true, no: false}
      booleanMatches?: { [key: string]: boolean };
    }
  | { type: 'select'; options: SpreadsheetImportSelectOption[] }
  | { type: 'multiSelect'; options: SpreadsheetImportSelectOption[] }
  | { type: 'input' };
