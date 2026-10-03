import { z } from 'zod';

import { normalizeSpreadsheetImportCheckboxValue } from '@/utils/spreadsheet-import/normalizeSpreadsheetImportCheckboxValue';
import { parseSpreadsheetImportMultiSelectOptionsOrThrow } from '@/utils/spreadsheet-import/parseSpreadsheetImportMultiSelectOptionsOrThrow';
import { type ImportedRow } from '@/utils/spreadsheet-import/types/ImportedRow';
import { type ImportedStructuredRow } from '@/utils/spreadsheet-import/types/ImportedStructuredRow';
import {
  SpreadsheetColumnType,
  type SpreadsheetColumns,
  type SpreadsheetMatchedOptions,
} from '@/utils/spreadsheet-import/types/SpreadsheetImportColumn';
import {
  type SpreadsheetImportFieldType,
  type SpreadsheetImportSelectOption,
} from '@/utils/spreadsheet-import/types/SpreadsheetImportFieldType';
import { isDefined } from '@/utils/validation/isDefined';

type NormalizedField = {
  key: string;
  fieldType: {
    readonly type: SpreadsheetImportFieldType['type'];
    readonly booleanMatches?: Readonly<Record<string, boolean>>;
    readonly options?: readonly SpreadsheetImportSelectOption[];
  };
};

// Server-side imports build matched options from a sample of the file, so an
// entry first seen after the sample is matched to the field options the way
// column matching does.
const findMatchedOptionValue = (
  matchedOptions: Partial<SpreadsheetMatchedOptions>[],
  field: NormalizedField,
  entry: unknown,
) => {
  const matchedOption = matchedOptions.find(
    (matchedOption) => matchedOption.entry === entry,
  );

  if (isDefined(matchedOption)) {
    return matchedOption.value;
  }

  return field.fieldType.options?.find(
    (option) => option.value === entry || option.label === entry,
  )?.value;
};

const multiSelectOptionsSchema = z.preprocess(
  (value) => parseSpreadsheetImportMultiSelectOptionsOrThrow(value),
  z.array(z.unknown()),
);

// Columns may come from an untrusted client, so a column only writes to the
// key of a field it was matched to.
export const normalizeSpreadsheetImportRows = (
  columns: SpreadsheetColumns,
  rows: ImportedRow[],
  fields: readonly NormalizedField[],
): ImportedStructuredRow[] => {
  const fieldByKey = new Map(fields.map((field) => [field.key, field]));

  return rows.map((row) =>
    columns.reduce<ImportedStructuredRow>((structuredRow, column, index) => {
      const cell = row[index];

      if (!('value' in column)) {
        return structuredRow;
      }

      const field = fieldByKey.get(column.value);

      if (!isDefined(field)) {
        return structuredRow;
      }

      switch (column.type) {
        case SpreadsheetColumnType.matchedCheckbox: {
          if (
            'booleanMatches' in field.fieldType &&
            Object.keys(field.fieldType).length > 0
          ) {
            const booleanMatchKey = Object.keys(
              field.fieldType.booleanMatches ?? {},
            ).find((key) => key.toLowerCase() === cell?.toLowerCase());

            if (!isDefined(booleanMatchKey)) {
              return structuredRow;
            }

            structuredRow[column.value] =
              field.fieldType.booleanMatches?.[booleanMatchKey];
          } else {
            structuredRow[column.value] =
              normalizeSpreadsheetImportCheckboxValue(cell);
          }

          return structuredRow;
        }
        case SpreadsheetColumnType.matched: {
          structuredRow[column.value] = cell === '' ? undefined : cell;

          return structuredRow;
        }
        case SpreadsheetColumnType.matchedSelect:
        case SpreadsheetColumnType.matchedSelectOptions: {
          if (field.fieldType.type === 'multiSelect' && isDefined(cell)) {
            const rawCurrentOptions =
              multiSelectOptionsSchema.safeParse(cell).data;

            const matchedOptionValues = [
              ...new Set(
                rawCurrentOptions
                  ?.map((option) =>
                    findMatchedOptionValue(
                      column.matchedOptions,
                      field,
                      option,
                    ),
                  )
                  .filter(isDefined),
              ),
            ];

            structuredRow[column.value] =
              matchedOptionValues.length > 0
                ? JSON.stringify(matchedOptionValues)
                : undefined;
          } else {
            structuredRow[column.value] =
              findMatchedOptionValue(column.matchedOptions, field, cell) ||
              undefined;
          }

          return structuredRow;
        }
        default:
          return structuredRow;
      }
    }, {}),
  );
};
