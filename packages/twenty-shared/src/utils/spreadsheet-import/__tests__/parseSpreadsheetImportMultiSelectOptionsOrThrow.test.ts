import { parseSpreadsheetImportMultiSelectOptionsOrThrow } from '@/utils/spreadsheet-import/parseSpreadsheetImportMultiSelectOptionsOrThrow';

describe('parseSpreadsheetImportMultiSelectOptionsOrThrow', () => {
  it('should parse multi select options', () => {
    const options = parseSpreadsheetImportMultiSelectOptionsOrThrow(
      '["option1", "option2"]',
    );
    expect(options).toEqual(['option1', 'option2']);
  });

  it('should parse multi select options with comma', () => {
    const options =
      parseSpreadsheetImportMultiSelectOptionsOrThrow('option1,option2');
    expect(options).toEqual(['option1', 'option2']);
  });

  it('should keep a single value that is valid JSON but not an array', () => {
    expect(parseSpreadsheetImportMultiSelectOptionsOrThrow('2024')).toEqual([
      '2024',
    ]);
    expect(parseSpreadsheetImportMultiSelectOptionsOrThrow('true')).toEqual([
      'true',
    ]);
    expect(parseSpreadsheetImportMultiSelectOptionsOrThrow('null')).toEqual([
      'null',
    ]);
  });

  it('should split comma separated values that are valid JSON scalars', () => {
    expect(
      parseSpreadsheetImportMultiSelectOptionsOrThrow('2023, 2024'),
    ).toEqual(['2023', '2024']);
  });

  it('should throw an error if the value is not parsable', () => {
    expect(() => parseSpreadsheetImportMultiSelectOptionsOrThrow({})).toThrow();
  });
});
