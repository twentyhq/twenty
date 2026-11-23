import { FieldMetadataType } from '@/types/FieldMetadataType';
import { coerceFormulaValue } from '@/utils/formula/coerceFormulaValue';

describe('coerceFormulaValue', () => {
  it.each([
    {
      value: 'Acme',
      fieldMetadataType: FieldMetadataType.TEXT,
      expected: 'Acme',
    },
    {
      value: 12.5,
      fieldMetadataType: FieldMetadataType.TEXT,
      expected: '12.5',
    },
    {
      value: true,
      fieldMetadataType: FieldMetadataType.TEXT,
      expected: 'true',
    },
    { value: {}, fieldMetadataType: FieldMetadataType.TEXT, expected: null },
    {
      value: 12.5,
      fieldMetadataType: FieldMetadataType.NUMBER,
      expected: 12.5,
    },
    {
      value: '12.5',
      fieldMetadataType: FieldMetadataType.NUMBER,
      expected: null,
    },
    {
      value: Number.POSITIVE_INFINITY,
      fieldMetadataType: FieldMetadataType.NUMBER,
      expected: null,
    },
    {
      value: false,
      fieldMetadataType: FieldMetadataType.BOOLEAN,
      expected: false,
    },
    { value: 0, fieldMetadataType: FieldMetadataType.BOOLEAN, expected: null },
    {
      value: '2026-03-04',
      fieldMetadataType: FieldMetadataType.DATE,
      expected: '2026-03-04',
    },
    {
      value: '2026-03-04T23:30:00.000Z',
      fieldMetadataType: FieldMetadataType.DATE,
      expected: '2026-03-04',
    },
    {
      value: 'soon',
      fieldMetadataType: FieldMetadataType.DATE,
      expected: null,
    },
    {
      value: '2026-03-04T23:30:00Z',
      fieldMetadataType: FieldMetadataType.DATE_TIME,
      expected: '2026-03-04T23:30:00.000Z',
    },
    {
      value: '2026-03-04',
      fieldMetadataType: FieldMetadataType.DATE_TIME,
      expected: '2026-03-04T00:00:00.000Z',
    },
    {
      value: null,
      fieldMetadataType: FieldMetadataType.DATE_TIME,
      expected: null,
    },
    {
      value: 3,
      fieldMetadataType: FieldMetadataType.RATING,
      expected: 'RATING_3',
    },
    {
      value: 'RATING_5',
      fieldMetadataType: FieldMetadataType.RATING,
      expected: 'RATING_5',
    },
    { value: 0, fieldMetadataType: FieldMetadataType.RATING, expected: null },
    { value: 2.5, fieldMetadataType: FieldMetadataType.RATING, expected: null },
    { value: 6, fieldMetadataType: FieldMetadataType.RATING, expected: null },
    {
      value: 'HOT',
      fieldMetadataType: FieldMetadataType.SELECT,
      expected: null,
    },
  ] as const)(
    'should coerce $value to $expected for a $fieldMetadataType field',
    ({ value, fieldMetadataType, expected }) => {
      expect(coerceFormulaValue({ value, fieldMetadataType })).toBe(expected);
    },
  );

  it('should keep a select value that is one of the options', () => {
    expect(
      coerceFormulaValue({
        value: 'HOT',
        fieldMetadataType: FieldMetadataType.SELECT,
        selectOptionValues: ['HOT', 'COLD'],
      }),
    ).toBe('HOT');
  });

  it('should drop a select value that is not one of the options', () => {
    expect(
      coerceFormulaValue({
        value: 'WARM',
        fieldMetadataType: FieldMetadataType.SELECT,
        selectOptionValues: ['HOT', 'COLD'],
      }),
    ).toBeNull();
  });
});
