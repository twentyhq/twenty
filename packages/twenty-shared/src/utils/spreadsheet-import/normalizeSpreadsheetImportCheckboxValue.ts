import { isNonEmptyString } from '@sniptt/guards';

const BOOLEAN_VALUE_BY_TEXT = new Map<string, boolean>([
  ['yes', true],
  ['no', false],
  ['true', true],
  ['false', false],
]);

export const normalizeSpreadsheetImportCheckboxValue = (
  value: string | undefined,
): boolean =>
  (isNonEmptyString(value) && BOOLEAN_VALUE_BY_TEXT.get(value.toLowerCase())) ||
  false;
