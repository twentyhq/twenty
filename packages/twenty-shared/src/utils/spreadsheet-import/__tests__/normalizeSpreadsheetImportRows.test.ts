import { normalizeSpreadsheetImportRows } from '@/utils/spreadsheet-import/normalizeSpreadsheetImportRows';
import {
  type SpreadsheetColumn,
  SpreadsheetColumnType,
  type SpreadsheetColumns,
} from '@/utils/spreadsheet-import/types/SpreadsheetImportColumn';

describe('normalizeSpreadsheetImportRows', () => {
  const columns: SpreadsheetColumn[] = [
    {
      index: 0,
      header: 'Name',
      type: SpreadsheetColumnType.matched,
      value: 'name',
    },
    {
      index: 1,
      header: 'Age',
      type: SpreadsheetColumnType.matched,
      value: 'age',
    },
    {
      index: 2,
      header: 'Active',
      type: SpreadsheetColumnType.matchedCheckbox,
      value: 'active',
    },
  ];

  const fields = [
    {
      key: 'name',
      label: 'Name',
      fieldType: { type: 'input' as const },
    },
    {
      key: 'age',
      label: 'Age',
      fieldType: { type: 'input' as const },
    },
    {
      key: 'active',
      label: 'Active',
      fieldType: {
        type: 'checkbox' as const,
      },
    },
  ];

  const rawData = [
    ['John', '30', 'Yes'],
    ['Alice', '', 'No'],
    ['Bob', '25', 'Maybe'],
  ];

  it('should normalize table data according to columns and fields', () => {
    const result = normalizeSpreadsheetImportRows(columns, rawData, fields);

    expect(result).toStrictEqual([
      { name: 'John', age: '30', active: true },
      { name: 'Alice', age: undefined, active: false },
      { name: 'Bob', age: '25', active: false },
    ]);
  });

  it('should normalize matchedCheckbox values and handle booleanMatches', () => {
    const columns: SpreadsheetColumn[] = [
      {
        index: 0,
        header: 'Active',
        type: SpreadsheetColumnType.matchedCheckbox,
        value: 'active',
      },
    ];

    const fields = [
      {
        key: 'active',
        label: 'Active',
        fieldType: {
          type: 'checkbox' as const,
          booleanMatches: { yes: true, no: false },
        },
        fieldMetadataItemId: '1',
        isNestedField: false,
      },
    ];

    const rawData = [['Yes'], ['No'], ['OtherValue']];

    const result = normalizeSpreadsheetImportRows(columns, rawData, fields);

    expect(result).toStrictEqual([{ active: true }, { active: false }, {}]);
  });

  it('should map matchedSelect and matchedSelectOptions values correctly', () => {
    const columns: SpreadsheetColumn[] = [
      {
        index: 0,
        header: 'Number',
        type: SpreadsheetColumnType.matchedSelect,
        value: 'number',
        matchedOptions: [
          { entry: 'One', value: '1' },
          { entry: 'Two', value: '2' },
        ],
      },
    ];

    const fields = [
      {
        key: 'number',
        label: 'Number',
        fieldType: {
          type: 'select' as const,
          options: [
            { label: 'One', value: '1' },
            { label: 'Two', value: '2' },
          ],
        },
      },
    ];

    const rawData = [['One'], ['Two'], ['OtherValue']];

    const result = normalizeSpreadsheetImportRows(columns, rawData, fields);

    expect(result).toStrictEqual([
      { number: '1' },
      { number: '2' },
      { number: undefined },
    ]);
  });

  it('should match entries missing from matched options to field options', () => {
    const columns: SpreadsheetColumn[] = [
      {
        index: 0,
        header: 'Number',
        type: SpreadsheetColumnType.matchedSelect,
        value: 'number',
        matchedOptions: [{ entry: 'One', value: '1' }, { entry: 'Skipped' }],
      },
      {
        index: 1,
        header: 'Tags',
        type: SpreadsheetColumnType.matchedSelect,
        value: 'tags',
        matchedOptions: [{ entry: 'A', value: 'a' }],
      },
    ];

    const options = [
      { label: 'One', value: '1' },
      { label: 'Two', value: '2' },
      { label: 'Skipped', value: 'skipped' },
    ];

    const fields = [
      {
        key: 'number',
        label: 'Number',
        fieldType: { type: 'select' as const, options },
      },
      {
        key: 'tags',
        label: 'Tags',
        fieldType: {
          type: 'multiSelect' as const,
          options: [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
          ],
        },
      },
    ];

    const rawData = [
      ['Two', 'A,B'],
      ['2', 'b,Unknown'],
      ['Skipped', 'Unknown'],
    ];

    const result = normalizeSpreadsheetImportRows(columns, rawData, fields);

    expect(result).toStrictEqual([
      { number: '2', tags: '["a","b"]' },
      { number: '2', tags: '["b"]' },
      { number: undefined, tags: undefined },
    ]);
  });

  it('should handle empty and ignored columns', () => {
    const columns: SpreadsheetColumn[] = [
      { index: 0, header: 'Empty', type: SpreadsheetColumnType.empty },
      { index: 1, header: 'Ignored', type: SpreadsheetColumnType.ignored },
    ];

    const rawData = [['Value1', 'Value2']];

    const result = normalizeSpreadsheetImportRows(columns, rawData, []);

    expect(result).toStrictEqual([{}]);
  });

  it('should handle unrecognized column types and return empty object', () => {
    const columns: SpreadsheetColumns = [
      {
        index: 0,
        header: 'Unrecognized',
        type: 'Unknown' as unknown as SpreadsheetColumnType.matched,
        value: '',
      },
    ];

    const rawData = [['Value']];

    const result = normalizeSpreadsheetImportRows(columns, rawData, []);

    expect(result).toStrictEqual([{}]);
  });
});
