import { filterByRange } from 'src/modules/dashboard/chart-data/utils/filter-by-range.util';

describe('filterByRange', () => {
  describe('rangeMin filtering', () => {
    it('should filter out results below rangeMin', () => {
      const results = [
        { groupByDimensionValues: ['A'], aggregateValue: 500 },
        { groupByDimensionValues: ['B'], aggregateValue: 1500 },
        { groupByDimensionValues: ['C'], aggregateValue: 2500 },
      ];

      const filtered = filterByRange(results, 1000);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].aggregateValue).toBe(1500);
      expect(filtered[1].aggregateValue).toBe(2500);
    });

    it('should include values equal to rangeMin', () => {
      const results = [
        { groupByDimensionValues: ['A'], aggregateValue: 500 },
        { groupByDimensionValues: ['B'], aggregateValue: 1000 },
        { groupByDimensionValues: ['C'], aggregateValue: 1500 },
      ];

      const filtered = filterByRange(results, 1000);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].aggregateValue).toBe(1000);
      expect(filtered[1].aggregateValue).toBe(1500);
    });
  });

  describe('rangeMax filtering', () => {
    it('should filter out results above rangeMax', () => {
      const results = [
        { groupByDimensionValues: ['A'], aggregateValue: 500 },
        { groupByDimensionValues: ['B'], aggregateValue: 1500 },
        { groupByDimensionValues: ['C'], aggregateValue: 2500 },
      ];

      const filtered = filterByRange(results, undefined, 2000);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].aggregateValue).toBe(500);
      expect(filtered[1].aggregateValue).toBe(1500);
    });

    it('should include values equal to rangeMax', () => {
      const results = [
        { groupByDimensionValues: ['A'], aggregateValue: 1500 },
        { groupByDimensionValues: ['B'], aggregateValue: 2000 },
        { groupByDimensionValues: ['C'], aggregateValue: 2500 },
      ];

      const filtered = filterByRange(results, undefined, 2000);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].aggregateValue).toBe(1500);
      expect(filtered[1].aggregateValue).toBe(2000);
    });
  });

  describe('combined range filtering', () => {
    it('should keep only results within range', () => {
      const results = [
        { groupByDimensionValues: ['A'], aggregateValue: 500 },
        { groupByDimensionValues: ['B'], aggregateValue: 1500 },
        { groupByDimensionValues: ['C'], aggregateValue: 2500 },
      ];

      const filtered = filterByRange(results, 1000, 2000);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].aggregateValue).toBe(1500);
    });

    it('should include boundary values', () => {
      const results = [
        { groupByDimensionValues: ['A'], aggregateValue: 500 },
        { groupByDimensionValues: ['B'], aggregateValue: 1000 },
        { groupByDimensionValues: ['C'], aggregateValue: 1500 },
        { groupByDimensionValues: ['D'], aggregateValue: 2000 },
        { groupByDimensionValues: ['E'], aggregateValue: 2500 },
      ];

      const filtered = filterByRange(results, 1000, 2000);

      expect(filtered).toHaveLength(3);
      expect(filtered[0].aggregateValue).toBe(1000);
      expect(filtered[1].aggregateValue).toBe(1500);
      expect(filtered[2].aggregateValue).toBe(2000);
    });
  });

  describe('no filters', () => {
    it('should return all results when no range is specified', () => {
      const results = [
        { groupByDimensionValues: ['A'], aggregateValue: 500 },
        { groupByDimensionValues: ['B'], aggregateValue: 1500 },
        { groupByDimensionValues: ['C'], aggregateValue: 2500 },
      ];

      const filtered = filterByRange(results);

      expect(filtered).toEqual(results);
    });

    it('should return all results when ranges are null', () => {
      const results = [
        { groupByDimensionValues: ['A'], aggregateValue: 500 },
        { groupByDimensionValues: ['B'], aggregateValue: 1500 },
        { groupByDimensionValues: ['C'], aggregateValue: 2500 },
      ];

      const filtered = filterByRange(results, null, null);

      expect(filtered).toEqual(results);
    });

    it('should return all results when ranges are undefined', () => {
      const results = [
        { groupByDimensionValues: ['A'], aggregateValue: 500 },
        { groupByDimensionValues: ['B'], aggregateValue: 1500 },
        { groupByDimensionValues: ['C'], aggregateValue: 2500 },
      ];

      const filtered = filterByRange(results, undefined, undefined);

      expect(filtered).toEqual(results);
    });
  });

  describe('edge cases', () => {
    it('should handle empty results array', () => {
      const filtered = filterByRange([], 1000, 2000);

      expect(filtered).toEqual([]);
    });

    it('should handle zero values', () => {
      const results = [
        { groupByDimensionValues: ['A'], aggregateValue: 0 },
        { groupByDimensionValues: ['B'], aggregateValue: 100 },
      ];

      const filtered = filterByRange(results, 0);

      expect(filtered).toHaveLength(2);
    });

    it('should handle negative values', () => {
      const results = [
        { groupByDimensionValues: ['A'], aggregateValue: -100 },
        { groupByDimensionValues: ['B'], aggregateValue: 0 },
        { groupByDimensionValues: ['C'], aggregateValue: 100 },
      ];

      const filtered = filterByRange(results, -50, 50);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].aggregateValue).toBe(0);
    });
  });
});
