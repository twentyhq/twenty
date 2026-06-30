import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { sortChartDataIfNeeded } from 'src/modules/dashboard/chart-data/utils/sort-chart-data-if-needed.util';

describe('sortChartDataIfNeeded', () => {
  type TestItem = { label: string; value: number };

  const testData: TestItem[] = [
    { label: 'Paris', value: 15 },
    { label: 'London', value: 22 },
    { label: 'Berlin', value: 8 },
  ];

  const formattedToRawLookup = new Map<string, string>([
    ['Paris', 'PARIS'],
    ['London', 'LONDON'],
    ['Berlin', 'BERLIN'],
  ]);

  const getFieldValue = (item: TestItem) => item.label;
  const getNumericValue = (item: TestItem) => item.value;

  describe('VALUE_ASC sorting', () => {
    it('should sort by numeric values in ascending order', () => {
      const result = sortChartDataIfNeeded({
        data: testData,
        orderBy: GraphOrderBy.VALUE_ASC,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
      });

      expect(result.map((item) => item.label)).toEqual([
        'Berlin',
        'Paris',
        'London',
      ]);
    });
  });

  describe('VALUE_DESC sorting', () => {
    it('should sort by numeric values in descending order', () => {
      const result = sortChartDataIfNeeded({
        data: testData,
        orderBy: GraphOrderBy.VALUE_DESC,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
      });

      expect(result.map((item) => item.label)).toEqual([
        'London',
        'Paris',
        'Berlin',
      ]);
    });
  });

  describe('MANUAL sorting', () => {
    it('should sort by manual order when provided', () => {
      const result = sortChartDataIfNeeded({
        data: testData,
        orderBy: GraphOrderBy.MANUAL,
        manualSortOrder: ['BERLIN', 'PARIS', 'LONDON'],
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
      });

      expect(result.map((item) => item.label)).toEqual([
        'Berlin',
        'Paris',
        'London',
      ]);
    });

    it('should return data unchanged when manual order is undefined', () => {
      const result = sortChartDataIfNeeded({
        data: testData,
        orderBy: GraphOrderBy.MANUAL,
        manualSortOrder: undefined,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
      });

      expect(result).toEqual(testData);
    });
  });

  describe('FIELD_POSITION_ASC sorting', () => {
    it('should sort by select option position in ascending order', () => {
      const selectFieldOptions = [
        { value: 'LONDON', position: 0 },
        { value: 'PARIS', position: 1 },
        { value: 'BERLIN', position: 2 },
      ];

      const result = sortChartDataIfNeeded({
        data: testData,
        orderBy: GraphOrderBy.FIELD_POSITION_ASC,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
        selectFieldOptions,
      });

      expect(result.map((item) => item.label)).toEqual([
        'London',
        'Paris',
        'Berlin',
      ]);
    });

    it('should return data unchanged when no select options provided', () => {
      const result = sortChartDataIfNeeded({
        data: testData,
        orderBy: GraphOrderBy.FIELD_POSITION_ASC,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
        selectFieldOptions: undefined,
      });

      expect(result).toEqual(testData);
    });
  });

  describe('FIELD_POSITION_DESC sorting', () => {
    it('should sort by select option position in descending order', () => {
      const selectFieldOptions = [
        { value: 'LONDON', position: 0 },
        { value: 'PARIS', position: 1 },
        { value: 'BERLIN', position: 2 },
      ];

      const result = sortChartDataIfNeeded({
        data: testData,
        orderBy: GraphOrderBy.FIELD_POSITION_DESC,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
        selectFieldOptions,
      });

      expect(result.map((item) => item.label)).toEqual([
        'Berlin',
        'Paris',
        'London',
      ]);
    });
  });

  describe('Edge cases', () => {
    it('should return data unchanged when orderBy is undefined', () => {
      const result = sortChartDataIfNeeded({
        data: testData,
        orderBy: undefined,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
      });

      expect(result).toEqual(testData);
    });

    it('should sort by field value ascending for FIELD_ASC', () => {
      const result = sortChartDataIfNeeded({
        data: testData,
        orderBy: GraphOrderBy.FIELD_ASC,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
      });

      expect(result.map((item) => item.label)).toEqual([
        'Berlin',
        'London',
        'Paris',
      ]);
    });

    it('should sort by field value descending for FIELD_DESC', () => {
      const result = sortChartDataIfNeeded({
        data: testData,
        orderBy: GraphOrderBy.FIELD_DESC,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
      });

      expect(result.map((item) => item.label)).toEqual([
        'Paris',
        'London',
        'Berlin',
      ]);
    });

    it('should handle empty data array', () => {
      const result = sortChartDataIfNeeded({
        data: [],
        orderBy: GraphOrderBy.VALUE_DESC,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
      });

      expect(result).toEqual([]);
    });

    it('should handle single item', () => {
      const singleItem = [{ label: 'Paris', value: 10 }];

      const result = sortChartDataIfNeeded({
        data: singleItem,
        orderBy: GraphOrderBy.VALUE_DESC,
        formattedToRawLookup,
        getFieldValue,
        getNumericValue,
      });

      expect(result).toEqual(singleItem);
    });
  });
});
