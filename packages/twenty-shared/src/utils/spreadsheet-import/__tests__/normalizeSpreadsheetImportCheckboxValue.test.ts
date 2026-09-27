import { normalizeSpreadsheetImportCheckboxValue } from '@/utils/spreadsheet-import/normalizeSpreadsheetImportCheckboxValue';

describe('normalizeSpreadsheetImportCheckboxValue', () => {
  const testCases = [
    { value: 'yes', expected: true },
    { value: 'Yes', expected: true },
    { value: 'no', expected: false },
    { value: 'No', expected: false },
    { value: 'true', expected: true },
    { value: 'True', expected: true },
    { value: 'false', expected: false },
    { value: 'False', expected: false },
    { value: undefined, expected: false },
    { value: 'invalid', expected: false },
  ];

  testCases.forEach(({ value, expected }) => {
    it(`should return ${expected} for value "${value}"`, () => {
      const result = normalizeSpreadsheetImportCheckboxValue(value);
      expect(result).toBe(expected);
    });
  });
});
