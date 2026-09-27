import { isNonEmptyString } from '@sniptt/guards';

import { type ImportedStructuredRow } from '@/utils/spreadsheet-import/types/ImportedStructuredRow';
import { type SpreadsheetImportFieldValidationDefinition } from '@/utils/spreadsheet-import/types/SpreadsheetImportFieldValidationDefinition';
import { type SpreadsheetImportErrorsByRowIndex } from '@/utils/spreadsheet-import/types/SpreadsheetImportRowErrors';
import {
  type SpreadsheetImportRowHook,
  type SpreadsheetImportTableHook,
} from '@/utils/spreadsheet-import/types/SpreadsheetImportTableHook';
import { isDefined } from '@/utils/validation/isDefined';

type ValidatedField<TMessage> = {
  key: string;
  fieldValidationDefinitions?: readonly SpreadsheetImportFieldValidationDefinition<TMessage>[];
};

// Hooks may replace rows, so the rows to validate are returned with the errors.
export const computeSpreadsheetImportRowErrors = <TMessage>({
  rows,
  fields,
  rowHook,
  tableHook,
}: {
  rows: ImportedStructuredRow[];
  fields: readonly ValidatedField<TMessage>[];
  rowHook?: SpreadsheetImportRowHook<TMessage>;
  tableHook?: SpreadsheetImportTableHook<TMessage>;
}): {
  rows: ImportedStructuredRow[];
  errors: SpreadsheetImportErrorsByRowIndex<TMessage>;
} => {
  const errors: SpreadsheetImportErrorsByRowIndex<TMessage> = {};
  let data = rows;

  const addError = (
    rowIndex: number,
    fieldKey: string,
    error: { message: TMessage; level: 'info' | 'warning' | 'error' },
  ) => {
    errors[rowIndex] = { ...errors[rowIndex], [fieldKey]: error };
  };

  if (isDefined(tableHook)) {
    data = tableHook(data, addError);
  }

  if (isDefined(rowHook)) {
    data = data.map((row, index) =>
      rowHook(row, (...props) => addError(index, ...props), data),
    );
  }

  for (const field of fields) {
    for (const definition of field.fieldValidationDefinitions ?? []) {
      const level = definition.level ?? 'error';

      switch (definition.rule) {
        case 'unique': {
          const taken = new Set<unknown>();
          const duplicates = new Set<unknown>();
          const values = data.map((entry) => entry[field.key]);

          for (const value of values) {
            if (definition.allowEmpty === true && !value) {
              continue;
            }

            if (taken.has(value)) {
              duplicates.add(value);
            } else {
              taken.add(value);
            }
          }

          values.forEach((value, index) => {
            if (duplicates.has(value)) {
              addError(index, field.key, {
                level,
                message: definition.errorMessage,
              });
            }
          });
          break;
        }
        case 'required': {
          data.forEach((entry, index) => {
            const value = entry[field.key];

            if (value === null || value === undefined || value === '') {
              addError(index, field.key, {
                level,
                message: definition.errorMessage,
              });
            }
          });
          break;
        }
        case 'regex': {
          const regex = new RegExp(definition.value, definition.flags);

          data.forEach((entry, index) => {
            const value = entry[field.key]?.toString();

            if (isNonEmptyString(value) && !value.match(regex)) {
              addError(index, field.key, {
                level,
                message: definition.errorMessage,
              });
            }
          });
          break;
        }
        case 'function': {
          data.forEach((entry, index) => {
            const value = entry[field.key]?.toString();

            if (isNonEmptyString(value) && !definition.isValid(value)) {
              addError(index, field.key, {
                level,
                message: definition.errorMessage,
              });
            }
          });
          break;
        }
      }
    }
  }

  return { rows: data, errors };
};
