import {
  FieldMetadataType,
  FirstDayOfTheWeek,
  ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataOptionMock } from 'src/engine/metadata-modules/flat-field-metadata-option/__mocks__/get-flat-field-metadata-option.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { formatDimensionValue } from 'src/modules/dashboard/chart-data/utils/format-dimension-value.util';

const createMockFieldMetadata = (
  overrides: Partial<FlatFieldMetadata>,
): FlatFieldMetadata =>
  ({
    id: 'test-id',
    name: 'testField',
    type: FieldMetadataType.TEXT,
    universalIdentifier: 'test-universal-id',
    ...overrides,
  }) as FlatFieldMetadata;

const userTimezone = 'Europe/Paris';
const firstDayOfTheWeek = FirstDayOfTheWeek.MONDAY;

describe('formatDimensionValue', () => {
  describe('null and undefined values', () => {
    it('should return "Not Set" for null value', () => {
      const fieldMetadata = createMockFieldMetadata({
        type: FieldMetadataType.TEXT,
      });

      const result = formatDimensionValue({
        value: null,
        fieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('Not Set');
    });

    it('should return "Not Set" for undefined value', () => {
      const fieldMetadata = createMockFieldMetadata({
        type: FieldMetadataType.TEXT,
      });

      const result = formatDimensionValue({
        value: undefined,
        fieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('Not Set');
    });
  });

  describe('SELECT field', () => {
    const selectFieldMetadata = createMockFieldMetadata({
      type: FieldMetadataType.SELECT,
      options: [
        { value: 'ACTIVE', label: 'Active', color: 'green', position: 0 },
        { value: 'INACTIVE', label: 'Inactive', color: 'red', position: 1 },
      ],
    });

    it('should return option label for matching value', () => {
      const result = formatDimensionValue({
        value: 'ACTIVE',
        fieldMetadata: selectFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('Active');
    });

    it('should return value as string when option not found', () => {
      const result = formatDimensionValue({
        value: 'UNKNOWN',
        fieldMetadata: selectFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('UNKNOWN');
    });

    it('should return the label of the option row over the stored option', () => {
      const optionUniversalIdentifier = '20202020-0000-4000-8000-000000000101';

      const result = formatDimensionValue({
        value: 'ACTIVE',
        fieldMetadata: createMockFieldMetadata({
          type: FieldMetadataType.SELECT,
          options: [
            { value: 'ACTIVE', label: 'Active', color: 'green', position: 0 },
          ],
          fieldMetadataOptionUniversalIdentifiers: [optionUniversalIdentifier],
        }),
        flatFieldMetadataOptionMaps: {
          ...createEmptyFlatEntityMaps(),
          byUniversalIdentifier: {
            [optionUniversalIdentifier]: getFlatFieldMetadataOptionMock({
              universalIdentifier: optionUniversalIdentifier,
              value: 'ACTIVE',
              label: 'Renamed',
              color: 'green',
              position: 0,
            }),
          },
        },
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('Renamed');
    });
  });

  describe('MULTI_SELECT field', () => {
    const multiSelectFieldMetadata = createMockFieldMetadata({
      type: FieldMetadataType.MULTI_SELECT,
      options: [
        { value: 'TAG1', label: 'Tag One', color: 'blue', position: 0 },
        { value: 'TAG2', label: 'Tag Two', color: 'green', position: 1 },
        { value: 'TAG3', label: 'Tag Three', color: 'red', position: 2 },
      ],
    });

    it('should return joined labels for array value', () => {
      const result = formatDimensionValue({
        value: ['TAG1', 'TAG2'],
        fieldMetadata: multiSelectFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('Tag One, Tag Two');
    });

    it('should parse postgres array format', () => {
      const result = formatDimensionValue({
        value: '{TAG1,TAG2}',
        fieldMetadata: multiSelectFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('Tag One, Tag Two');
    });

    it('should handle empty postgres array format', () => {
      const result = formatDimensionValue({
        value: '{}',
        fieldMetadata: multiSelectFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('');
    });

    it('should handle single value', () => {
      const result = formatDimensionValue({
        value: 'TAG1',
        fieldMetadata: multiSelectFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('Tag One');
    });
  });

  describe('BOOLEAN field', () => {
    const booleanFieldMetadata = createMockFieldMetadata({
      type: FieldMetadataType.BOOLEAN,
    });

    it('should return "Yes" for true', () => {
      const result = formatDimensionValue({
        value: true,
        fieldMetadata: booleanFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('Yes');
    });

    it('should return "No" for false', () => {
      const result = formatDimensionValue({
        value: false,
        fieldMetadata: booleanFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('No');
    });
  });

  describe('DATE and DATE_TIME fields', () => {
    const dateFieldMetadata = createMockFieldMetadata({
      type: FieldMetadataType.DATE,
    });

    const dateTimeFieldMetadata = createMockFieldMetadata({
      type: FieldMetadataType.DATE_TIME,
    });

    it('should return string value for DAY_OF_THE_WEEK granularity', () => {
      const result = formatDimensionValue({
        value: 'Monday',
        fieldMetadata: dateFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('Monday');
    });

    it('should return string value for MONTH_OF_THE_YEAR granularity', () => {
      const result = formatDimensionValue({
        value: 'January',
        fieldMetadata: dateFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        dateGranularity: ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('January');
    });

    it('should return string value for QUARTER_OF_THE_YEAR granularity', () => {
      const result = formatDimensionValue({
        value: 'Q1',
        fieldMetadata: dateFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        dateGranularity: ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('Q1');
    });

    it('should format date for DAY granularity', () => {
      const result = formatDimensionValue({
        value: '2024-01-15',
        fieldMetadata: dateFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should format datetime for MONTH granularity', () => {
      const result = formatDimensionValue({
        value: '2024-01-15',
        fieldMetadata: dateTimeFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        dateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('RELATION field', () => {
    const relationFieldMetadata = createMockFieldMetadata({
      type: FieldMetadataType.RELATION,
    });

    it('should return string value for relation', () => {
      const result = formatDimensionValue({
        value: 'Company Name',
        fieldMetadata: relationFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('Company Name');
    });

    it('should return string value for relation with date granularity', () => {
      const result = formatDimensionValue({
        value: '2024-01-15',
        fieldMetadata: relationFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('2024-01-15');
    });

    it('should return string value for DAY_OF_THE_WEEK granularity', () => {
      const result = formatDimensionValue({
        value: 'Monday',
        fieldMetadata: relationFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('Monday');
    });
  });

  describe('RELATION field with label resolution', () => {
    const relationFieldMetadata = createMockFieldMetadata({
      type: FieldMetadataType.RELATION,
    });
    const relationLabelByRecordId = new Map([['record-id-1', 'Alice Smith']]);

    it('should return the resolved label when the record id is in the map', () => {
      const result = formatDimensionValue({
        value: 'record-id-1',
        fieldMetadata: relationFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
        relationLabelByRecordId,
      });

      expect(result).toBe('Alice Smith');
    });

    it('should return the resolved label even when a date granularity is set', () => {
      const result = formatDimensionValue({
        value: 'record-id-1',
        fieldMetadata: relationFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        userTimezone,
        firstDayOfTheWeek,
        relationLabelByRecordId,
      });

      expect(result).toBe('Alice Smith');
    });

    it('should return "Unknown" when the record id is not in the map', () => {
      const result = formatDimensionValue({
        value: 'record-id-2',
        fieldMetadata: relationFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
        relationLabelByRecordId,
      });

      expect(result).toBe('Unknown');
    });

    it('should keep returning the raw value when a subFieldName is set', () => {
      const result = formatDimensionValue({
        value: 'Acme',
        fieldMetadata: relationFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        subFieldName: 'name',
        userTimezone,
        firstDayOfTheWeek,
        relationLabelByRecordId,
      });

      expect(result).toBe('Acme');
    });

    it('should return "Not Set" for null value even with a map', () => {
      const result = formatDimensionValue({
        value: null,
        fieldMetadata: relationFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
        relationLabelByRecordId,
      });

      expect(result).toBe('Not Set');
    });
  });

  describe('MORPH_RELATION field', () => {
    const morphRelationFieldMetadata = createMockFieldMetadata({
      type: FieldMetadataType.MORPH_RELATION,
    });

    it('should return the resolved label when the record id is in the map', () => {
      const result = formatDimensionValue({
        value: 'record-id-1',
        fieldMetadata: morphRelationFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
        relationLabelByRecordId: new Map([['record-id-1', 'Acme Inc']]),
      });

      expect(result).toBe('Acme Inc');
    });

    it('should return the raw value without a map', () => {
      const result = formatDimensionValue({
        value: 'record-id-1',
        fieldMetadata: morphRelationFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('record-id-1');
    });
  });

  describe('NUMBER field', () => {
    const numberFieldMetadata = createMockFieldMetadata({
      type: FieldMetadataType.NUMBER,
    });

    it('should format number with short number format', () => {
      const result = formatDimensionValue({
        value: 1500,
        fieldMetadata: numberFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('1.5k');
    });

    it('should handle string number value', () => {
      const result = formatDimensionValue({
        value: '2000',
        fieldMetadata: numberFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('2k');
    });

    it('should return string for NaN value', () => {
      const result = formatDimensionValue({
        value: 'not a number',
        fieldMetadata: numberFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('not a number');
    });

    it('should handle zero', () => {
      const result = formatDimensionValue({
        value: 0,
        fieldMetadata: numberFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('0');
    });
  });

  describe('CURRENCY field', () => {
    const currencyFieldMetadata = createMockFieldMetadata({
      type: FieldMetadataType.CURRENCY,
    });

    it('should format currency amount value', () => {
      const result = formatDimensionValue({
        value: 1500,
        fieldMetadata: currencyFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('1.5k');
    });

    it('should return currency code as-is for currencyCode subfield', () => {
      const result = formatDimensionValue({
        value: 'USD',
        fieldMetadata: currencyFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        subFieldName: 'currencyCode',
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('USD');
    });

    it('should return "Not Set" for empty currency code', () => {
      const result = formatDimensionValue({
        value: '',
        fieldMetadata: currencyFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        subFieldName: 'currencyCode',
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('Not Set');
    });
  });

  describe('TEXT and other fields', () => {
    const textFieldMetadata = createMockFieldMetadata({
      type: FieldMetadataType.TEXT,
    });

    it('should return string value', () => {
      const result = formatDimensionValue({
        value: 'Hello World',
        fieldMetadata: textFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('Hello World');
    });

    it('should convert number to string', () => {
      const result = formatDimensionValue({
        value: 123,
        fieldMetadata: textFieldMetadata,
        flatFieldMetadataOptionMaps: undefined,
        userTimezone,
        firstDayOfTheWeek,
      });

      expect(result).toBe('123');
    });
  });
});
