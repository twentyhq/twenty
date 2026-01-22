import { filterTwoDimensionalDataByRange } from 'src/modules/dashboard/chart-data/utils/filter-two-dimensional-data-by-range.util';

describe('filterTwoDimensionalDataByRange', () => {
  describe('no filters', () => {
    it('should return all data when no range is specified', () => {
      const data = [
        { category: 'A', seriesA: 100, seriesB: 200 },
        { category: 'B', seriesA: 300, seriesB: 400 },
      ];
      const keys = ['seriesA', 'seriesB'];

      const filtered = filterTwoDimensionalDataByRange(data, keys);

      expect(filtered).toEqual(data);
    });

    it('should return all data when ranges are null', () => {
      const data = [
        { category: 'A', seriesA: 100, seriesB: 200 },
        { category: 'B', seriesA: 300, seriesB: 400 },
      ];
      const keys = ['seriesA', 'seriesB'];

      const filtered = filterTwoDimensionalDataByRange(data, keys, null, null);

      expect(filtered).toEqual(data);
    });

    it('should return all data when ranges are undefined', () => {
      const data = [
        { category: 'A', seriesA: 100, seriesB: 200 },
        { category: 'B', seriesA: 300, seriesB: 400 },
      ];
      const keys = ['seriesA', 'seriesB'];

      const filtered = filterTwoDimensionalDataByRange(
        data,
        keys,
        undefined,
        undefined,
      );

      expect(filtered).toEqual(data);
    });
  });

  describe('rangeMin filtering', () => {
    it('should filter out data with total below rangeMin', () => {
      const data = [
        { category: 'A', seriesA: 100, seriesB: 100 }, // total: 200
        { category: 'B', seriesA: 300, seriesB: 200 }, // total: 500
        { category: 'C', seriesA: 500, seriesB: 500 }, // total: 1000
      ];
      const keys = ['seriesA', 'seriesB'];

      const filtered = filterTwoDimensionalDataByRange(data, keys, 400);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].category).toBe('B');
      expect(filtered[1].category).toBe('C');
    });

    it('should include data with total equal to rangeMin', () => {
      const data = [
        { category: 'A', seriesA: 100, seriesB: 100 }, // total: 200
        { category: 'B', seriesA: 200, seriesB: 200 }, // total: 400
        { category: 'C', seriesA: 500, seriesB: 500 }, // total: 1000
      ];
      const keys = ['seriesA', 'seriesB'];

      const filtered = filterTwoDimensionalDataByRange(data, keys, 400);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].category).toBe('B');
      expect(filtered[1].category).toBe('C');
    });
  });

  describe('rangeMax filtering', () => {
    it('should filter out data with total above rangeMax', () => {
      const data = [
        { category: 'A', seriesA: 100, seriesB: 100 }, // total: 200
        { category: 'B', seriesA: 300, seriesB: 200 }, // total: 500
        { category: 'C', seriesA: 500, seriesB: 500 }, // total: 1000
      ];
      const keys = ['seriesA', 'seriesB'];

      const filtered = filterTwoDimensionalDataByRange(
        data,
        keys,
        undefined,
        600,
      );

      expect(filtered).toHaveLength(2);
      expect(filtered[0].category).toBe('A');
      expect(filtered[1].category).toBe('B');
    });

    it('should include data with total equal to rangeMax', () => {
      const data = [
        { category: 'A', seriesA: 100, seriesB: 100 }, // total: 200
        { category: 'B', seriesA: 300, seriesB: 200 }, // total: 500
        { category: 'C', seriesA: 500, seriesB: 500 }, // total: 1000
      ];
      const keys = ['seriesA', 'seriesB'];

      const filtered = filterTwoDimensionalDataByRange(
        data,
        keys,
        undefined,
        500,
      );

      expect(filtered).toHaveLength(2);
      expect(filtered[0].category).toBe('A');
      expect(filtered[1].category).toBe('B');
    });
  });

  describe('combined range filtering', () => {
    it('should keep only data within range', () => {
      const data = [
        { category: 'A', seriesA: 100, seriesB: 100 }, // total: 200
        { category: 'B', seriesA: 300, seriesB: 200 }, // total: 500
        { category: 'C', seriesA: 500, seriesB: 500 }, // total: 1000
      ];
      const keys = ['seriesA', 'seriesB'];

      const filtered = filterTwoDimensionalDataByRange(data, keys, 300, 800);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe('B');
    });

    it('should include boundary values', () => {
      const data = [
        { category: 'A', seriesA: 100, seriesB: 100 }, // total: 200
        { category: 'B', seriesA: 150, seriesB: 150 }, // total: 300
        { category: 'C', seriesA: 300, seriesB: 200 }, // total: 500
        { category: 'D', seriesA: 400, seriesB: 400 }, // total: 800
        { category: 'E', seriesA: 500, seriesB: 500 }, // total: 1000
      ];
      const keys = ['seriesA', 'seriesB'];

      const filtered = filterTwoDimensionalDataByRange(data, keys, 300, 800);

      expect(filtered).toHaveLength(3);
      expect(filtered[0].category).toBe('B');
      expect(filtered[1].category).toBe('C');
      expect(filtered[2].category).toBe('D');
    });
  });

  describe('edge cases', () => {
    it('should handle empty data array', () => {
      const filtered = filterTwoDimensionalDataByRange(
        [],
        ['seriesA'],
        100,
        200,
      );

      expect(filtered).toEqual([]);
    });

    it('should handle empty keys array', () => {
      const data = [
        { category: 'A', seriesA: 100 },
        { category: 'B', seriesA: 200 },
      ];

      // With empty keys, total is always 0
      const filtered = filterTwoDimensionalDataByRange(data, [], 0, 0);

      expect(filtered).toHaveLength(2);
    });

    it('should ignore non-numeric values when summing', () => {
      const data = [
        {
          category: 'A',
          seriesA: 100,
          seriesB: 'invalid' as unknown as number,
        },
        { category: 'B', seriesA: 300, seriesB: 200 },
      ];
      const keys = ['seriesA', 'seriesB'];

      // category A total is 100 (invalid is treated as 0)
      // category B total is 500
      const filtered = filterTwoDimensionalDataByRange(data, keys, 200);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe('B');
    });

    it('should handle zero values', () => {
      const data = [
        { category: 'A', seriesA: 0, seriesB: 0 }, // total: 0
        { category: 'B', seriesA: 0, seriesB: 100 }, // total: 100
      ];
      const keys = ['seriesA', 'seriesB'];

      const filtered = filterTwoDimensionalDataByRange(data, keys, 0, 50);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe('A');
    });

    it('should handle single key', () => {
      const data = [
        { category: 'A', value: 100 },
        { category: 'B', value: 300 },
        { category: 'C', value: 500 },
      ];
      const keys = ['value'];

      const filtered = filterTwoDimensionalDataByRange(data, keys, 200, 400);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe('B');
    });
  });
});
