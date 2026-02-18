import {
  fillSelectGaps,
  fillSelectGapsTwoDimensional,
} from 'src/modules/dashboard/chart-data/utils/fill-select-gaps.util';

describe('fillSelectGaps', () => {
  const selectOptions = [
    { value: 'A', label: 'Option A', position: 0 },
    { value: 'B', label: 'Option B', position: 1 },
    { value: 'C', label: 'Option C', position: 2 },
  ];

  describe('edge cases', () => {
    it('should return data unchanged when selectOptions is undefined', () => {
      const data = [
        { groupByDimensionValues: ['A'], aggregateValue: 5 },
        { groupByDimensionValues: ['B'], aggregateValue: 3 },
      ];

      const result = fillSelectGaps({
        data,
        selectOptions: undefined,
      });

      expect(result).toEqual(data);
    });

    it('should return data unchanged when selectOptions is null', () => {
      const data = [
        { groupByDimensionValues: ['A'], aggregateValue: 5 },
        { groupByDimensionValues: ['B'], aggregateValue: 3 },
      ];

      const result = fillSelectGaps({
        data,
        selectOptions: null,
      });

      expect(result).toEqual(data);
    });

    it('should return data unchanged when selectOptions is empty', () => {
      const data = [
        { groupByDimensionValues: ['A'], aggregateValue: 5 },
        { groupByDimensionValues: ['B'], aggregateValue: 3 },
      ];

      const result = fillSelectGaps({
        data,
        selectOptions: [],
      });

      expect(result).toEqual(data);
    });

    it('should return empty data unchanged', () => {
      const result = fillSelectGaps({
        data: [],
        selectOptions,
      });

      expect(result).toEqual([]);
    });
  });

  describe('gap filling', () => {
    it('should fill missing select options with zero values', () => {
      const data = [
        { groupByDimensionValues: ['A'], aggregateValue: 5 },
        { groupByDimensionValues: ['C'], aggregateValue: 3 },
      ];

      const result = fillSelectGaps({
        data,
        selectOptions,
      });

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        groupByDimensionValues: ['A'],
        aggregateValue: 5,
      });
      expect(result[1]).toEqual({
        groupByDimensionValues: ['B'],
        aggregateValue: 0,
      });
      expect(result[2]).toEqual({
        groupByDimensionValues: ['C'],
        aggregateValue: 3,
      });
    });

    it('should preserve existing data values', () => {
      const data = [
        { groupByDimensionValues: ['A'], aggregateValue: 10 },
        { groupByDimensionValues: ['B'], aggregateValue: 20 },
        { groupByDimensionValues: ['C'], aggregateValue: 30 },
      ];

      const result = fillSelectGaps({
        data,
        selectOptions,
      });

      expect(result).toHaveLength(3);
      expect(result[0].aggregateValue).toBe(10);
      expect(result[1].aggregateValue).toBe(20);
      expect(result[2].aggregateValue).toBe(30);
    });

    it('should preserve selectOptions order', () => {
      const data = [
        { groupByDimensionValues: ['C'], aggregateValue: 3 },
        { groupByDimensionValues: ['A'], aggregateValue: 5 },
      ];

      const result = fillSelectGaps({
        data,
        selectOptions,
      });

      expect(result).toHaveLength(3);
      expect(result[0].groupByDimensionValues[0]).toBe('A');
      expect(result[1].groupByDimensionValues[0]).toBe('B');
      expect(result[2].groupByDimensionValues[0]).toBe('C');
    });
  });
});

describe('fillSelectGapsTwoDimensional', () => {
  const selectOptions = [
    { value: 'A', label: 'Option A', position: 0 },
    { value: 'B', label: 'Option B', position: 1 },
    { value: 'C', label: 'Option C', position: 2 },
  ];

  describe('edge cases', () => {
    it('should return data unchanged when selectOptions is undefined', () => {
      const data = [
        { groupByDimensionValues: ['A', 'X'], aggregateValue: 5 },
        { groupByDimensionValues: ['B', 'X'], aggregateValue: 3 },
      ];

      const result = fillSelectGapsTwoDimensional({
        data,
        selectOptions: undefined,
      });

      expect(result).toEqual(data);
    });

    it('should return data unchanged when selectOptions is null', () => {
      const data = [
        { groupByDimensionValues: ['A', 'X'], aggregateValue: 5 },
        { groupByDimensionValues: ['B', 'X'], aggregateValue: 3 },
      ];

      const result = fillSelectGapsTwoDimensional({
        data,
        selectOptions: null,
      });

      expect(result).toEqual(data);
    });

    it('should return data unchanged when selectOptions is empty', () => {
      const data = [
        { groupByDimensionValues: ['A', 'X'], aggregateValue: 5 },
        { groupByDimensionValues: ['B', 'X'], aggregateValue: 3 },
      ];

      const result = fillSelectGapsTwoDimensional({
        data,
        selectOptions: [],
      });

      expect(result).toEqual(data);
    });

    it('should return empty data unchanged', () => {
      const result = fillSelectGapsTwoDimensional({
        data: [],
        selectOptions,
      });

      expect(result).toEqual([]);
    });
  });

  describe('gap filling', () => {
    it('should fill missing primary axis options for all secondary values', () => {
      const data = [
        { groupByDimensionValues: ['A', 'X'], aggregateValue: 5 },
        { groupByDimensionValues: ['C', 'X'], aggregateValue: 3 },
        { groupByDimensionValues: ['A', 'Y'], aggregateValue: 2 },
      ];

      const result = fillSelectGapsTwoDimensional({
        data,
        selectOptions,
      });

      expect(result).toHaveLength(6);

      expect(
        result.filter((r) => r.groupByDimensionValues[0] === 'A'),
      ).toHaveLength(2);
      expect(
        result.filter((r) => r.groupByDimensionValues[0] === 'B'),
      ).toHaveLength(2);
      expect(
        result.filter((r) => r.groupByDimensionValues[0] === 'C'),
      ).toHaveLength(2);
    });

    it('should create zero-value entries for missing combinations', () => {
      const data = [
        { groupByDimensionValues: ['A', 'X'], aggregateValue: 5 },
        { groupByDimensionValues: ['C', 'Y'], aggregateValue: 3 },
      ];

      const result = fillSelectGapsTwoDimensional({
        data,
        selectOptions,
      });

      expect(result).toHaveLength(6);

      expect(
        result.find(
          (r) =>
            r.groupByDimensionValues[0] === 'B' &&
            r.groupByDimensionValues[1] === 'X',
        ),
      ).toEqual({
        groupByDimensionValues: ['B', 'X'],
        aggregateValue: 0,
      });

      expect(
        result.find(
          (r) =>
            r.groupByDimensionValues[0] === 'A' &&
            r.groupByDimensionValues[1] === 'Y',
        ),
      ).toEqual({
        groupByDimensionValues: ['A', 'Y'],
        aggregateValue: 0,
      });
    });

    it('should preserve existing combinations', () => {
      const data = [
        { groupByDimensionValues: ['A', 'X'], aggregateValue: 5 },
        { groupByDimensionValues: ['B', 'X'], aggregateValue: 10 },
        { groupByDimensionValues: ['C', 'X'], aggregateValue: 15 },
        { groupByDimensionValues: ['A', 'Y'], aggregateValue: 20 },
        { groupByDimensionValues: ['B', 'Y'], aggregateValue: 25 },
        { groupByDimensionValues: ['C', 'Y'], aggregateValue: 30 },
      ];

      const result = fillSelectGapsTwoDimensional({
        data,
        selectOptions,
      });

      expect(result).toHaveLength(6);

      expect(
        result.find(
          (r) =>
            r.groupByDimensionValues[0] === 'A' &&
            r.groupByDimensionValues[1] === 'X',
        ),
      ).toEqual({
        groupByDimensionValues: ['A', 'X'],
        aggregateValue: 5,
      });
    });

    it('should preserve selectOptions order for primary axis', () => {
      const data = [
        { groupByDimensionValues: ['C', 'X'], aggregateValue: 3 },
        { groupByDimensionValues: ['A', 'X'], aggregateValue: 5 },
      ];

      const result = fillSelectGapsTwoDimensional({
        data,
        selectOptions,
      });

      const primaryValues = result.map((r) => r.groupByDimensionValues[0]);
      const uniquePrimary = [...new Set(primaryValues)];

      expect(uniquePrimary[0]).toBe('A');
      expect(uniquePrimary[1]).toBe('B');
      expect(uniquePrimary[2]).toBe('C');
    });

    it('should handle null secondary dimension values', () => {
      const data = [
        { groupByDimensionValues: ['A', null], aggregateValue: 5 },
        { groupByDimensionValues: ['C', null], aggregateValue: 3 },
      ];

      const result = fillSelectGapsTwoDimensional({
        data,
        selectOptions,
      });

      expect(result).toHaveLength(3);

      expect(
        result.find(
          (r) =>
            r.groupByDimensionValues[0] === 'B' &&
            r.groupByDimensionValues[1] === null,
        ),
      ).toEqual({
        groupByDimensionValues: ['B', null],
        aggregateValue: 0,
      });
    });

    it('should not fill missing secondary axis values', () => {
      const data = [
        { groupByDimensionValues: ['A', 'X'], aggregateValue: 5 },
        { groupByDimensionValues: ['A', 'Y'], aggregateValue: 3 },
      ];

      const result = fillSelectGapsTwoDimensional({
        data,
        selectOptions,
      });

      const secondaryValues = result.map((r) => r.groupByDimensionValues[1]);
      const uniqueSecondary = [...new Set(secondaryValues)];

      expect(uniqueSecondary).toHaveLength(2);
      expect(uniqueSecondary).toContain('X');
      expect(uniqueSecondary).toContain('Y');
    });
  });
});
