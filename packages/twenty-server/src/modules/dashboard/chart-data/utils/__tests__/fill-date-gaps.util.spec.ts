import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';

import {
  fillDateGaps,
  fillDateGapsTwoDimensional,
} from 'src/modules/dashboard/chart-data/utils/fill-date-gaps.util';

describe('fillDateGaps', () => {
  describe('edge cases', () => {
    it('should return empty data unchanged', () => {
      const result = fillDateGaps({
        data: [],
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
      });

      expect(result.data).toEqual([]);
      expect(result.wasTruncated).toBe(false);
    });

    it('should return data unchanged when dateGranularity is null', () => {
      const data = [
        { groupByDimensionValues: ['2024-01-01'], aggregateValue: 5 },
        { groupByDimensionValues: ['2024-01-03'], aggregateValue: 3 },
      ];

      const result = fillDateGaps({
        data,
        dateGranularity: null,
      });

      expect(result.data).toEqual(data);
      expect(result.wasTruncated).toBe(false);
    });

    it('should return data unchanged when dateGranularity is undefined', () => {
      const data = [
        { groupByDimensionValues: ['2024-01-01'], aggregateValue: 5 },
        { groupByDimensionValues: ['2024-01-03'], aggregateValue: 3 },
      ];

      const result = fillDateGaps({
        data,
        dateGranularity: undefined,
      });

      expect(result.data).toEqual(data);
      expect(result.wasTruncated).toBe(false);
    });
  });

  describe('granularities without gap filling', () => {
    it('should not fill gaps for DAY_OF_THE_WEEK granularity', () => {
      const data = [
        { groupByDimensionValues: ['Monday'], aggregateValue: 5 },
        { groupByDimensionValues: ['Friday'], aggregateValue: 3 },
      ];

      const result = fillDateGaps({
        data,
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK,
      });

      expect(result.data).toEqual(data);
      expect(result.wasTruncated).toBe(false);
    });

    it('should not fill gaps for MONTH_OF_THE_YEAR granularity', () => {
      const data = [
        { groupByDimensionValues: ['January'], aggregateValue: 5 },
        { groupByDimensionValues: ['March'], aggregateValue: 3 },
      ];

      const result = fillDateGaps({
        data,
        dateGranularity: ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR,
      });

      expect(result.data).toEqual(data);
      expect(result.wasTruncated).toBe(false);
    });

    it('should not fill gaps for QUARTER_OF_THE_YEAR granularity', () => {
      const data = [
        { groupByDimensionValues: ['Q1'], aggregateValue: 5 },
        { groupByDimensionValues: ['Q4'], aggregateValue: 3 },
      ];

      const result = fillDateGaps({
        data,
        dateGranularity: ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR,
      });

      expect(result.data).toEqual(data);
      expect(result.wasTruncated).toBe(false);
    });

    it('should not fill gaps for NONE granularity', () => {
      const data = [
        { groupByDimensionValues: ['2024-01-01'], aggregateValue: 5 },
        { groupByDimensionValues: ['2024-01-03'], aggregateValue: 3 },
      ];

      const result = fillDateGaps({
        data,
        dateGranularity: ObjectRecordGroupByDateGranularity.NONE,
      });

      expect(result.data).toEqual(data);
      expect(result.wasTruncated).toBe(false);
    });
  });

  describe('DAY granularity gap filling', () => {
    it('should fill missing days with zero values', () => {
      const data = [
        { groupByDimensionValues: ['2024-01-01'], aggregateValue: 5 },
        { groupByDimensionValues: ['2024-01-03'], aggregateValue: 3 },
      ];

      const result = fillDateGaps({
        data,
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
      });

      expect(result.data).toHaveLength(3);
      expect(result.wasTruncated).toBe(false);
      expect(result.data[0]).toEqual({
        groupByDimensionValues: ['2024-01-01'],
        aggregateValue: 5,
      });
      expect(result.data[1]).toEqual({
        groupByDimensionValues: ['2024-01-02'],
        aggregateValue: 0,
      });
      expect(result.data[2]).toEqual({
        groupByDimensionValues: ['2024-01-03'],
        aggregateValue: 3,
      });
    });

    it('should preserve existing data values', () => {
      const data = [
        { groupByDimensionValues: ['2024-01-01'], aggregateValue: 10 },
        { groupByDimensionValues: ['2024-01-02'], aggregateValue: 20 },
        { groupByDimensionValues: ['2024-01-03'], aggregateValue: 30 },
      ];

      const result = fillDateGaps({
        data,
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
      });

      expect(result.data).toHaveLength(3);
      expect(result.data[0].aggregateValue).toBe(10);
      expect(result.data[1].aggregateValue).toBe(20);
      expect(result.data[2].aggregateValue).toBe(30);
    });

    it('should handle descending order', () => {
      const data = [
        { groupByDimensionValues: ['2024-01-03'], aggregateValue: 3 },
        { groupByDimensionValues: ['2024-01-01'], aggregateValue: 5 },
      ];

      const result = fillDateGaps({
        data,
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        isDescOrder: true,
      });

      expect(result.data).toHaveLength(3);
      expect(result.data[0].groupByDimensionValues[0]).toBe('2024-01-03');
      expect(result.data[1].groupByDimensionValues[0]).toBe('2024-01-02');
      expect(result.data[2].groupByDimensionValues[0]).toBe('2024-01-01');
    });
  });

  describe('MONTH granularity gap filling', () => {
    it('should fill missing months with zero values', () => {
      const data = [
        { groupByDimensionValues: ['2024-01-01'], aggregateValue: 5 },
        { groupByDimensionValues: ['2024-04-01'], aggregateValue: 3 },
      ];

      const result = fillDateGaps({
        data,
        dateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
      });

      expect(result.data).toHaveLength(4);
      expect(result.wasTruncated).toBe(false);
      expect(result.data[0].groupByDimensionValues[0]).toBe('2024-01-01');
      expect(result.data[1].groupByDimensionValues[0]).toBe('2024-02-01');
      expect(result.data[2].groupByDimensionValues[0]).toBe('2024-03-01');
      expect(result.data[3].groupByDimensionValues[0]).toBe('2024-04-01');
    });
  });

  describe('WEEK granularity gap filling', () => {
    it('should fill missing weeks with zero values', () => {
      const data = [
        { groupByDimensionValues: ['2024-01-01'], aggregateValue: 5 },
        { groupByDimensionValues: ['2024-01-22'], aggregateValue: 3 },
      ];

      const result = fillDateGaps({
        data,
        dateGranularity: ObjectRecordGroupByDateGranularity.WEEK,
      });

      expect(result.data).toHaveLength(4);
      expect(result.wasTruncated).toBe(false);
      expect(result.data[0].groupByDimensionValues[0]).toBe('2024-01-01');
      expect(result.data[1].groupByDimensionValues[0]).toBe('2024-01-08');
      expect(result.data[2].groupByDimensionValues[0]).toBe('2024-01-15');
      expect(result.data[3].groupByDimensionValues[0]).toBe('2024-01-22');
    });
  });
});

describe('fillDateGapsTwoDimensional', () => {
  describe('edge cases', () => {
    it('should return empty data unchanged', () => {
      const result = fillDateGapsTwoDimensional({
        data: [],
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
      });

      expect(result.data).toEqual([]);
      expect(result.wasTruncated).toBe(false);
    });

    it('should return data unchanged when dateGranularity is null', () => {
      const data = [
        { groupByDimensionValues: ['2024-01-01', 'A'], aggregateValue: 5 },
        { groupByDimensionValues: ['2024-01-03', 'B'], aggregateValue: 3 },
      ];

      const result = fillDateGapsTwoDimensional({
        data,
        dateGranularity: null,
      });

      expect(result.data).toEqual(data);
      expect(result.wasTruncated).toBe(false);
    });
  });

  describe('granularities without gap filling', () => {
    it('should not fill gaps for DAY_OF_THE_WEEK granularity', () => {
      const data = [
        { groupByDimensionValues: ['Monday', 'A'], aggregateValue: 5 },
        { groupByDimensionValues: ['Friday', 'B'], aggregateValue: 3 },
      ];

      const result = fillDateGapsTwoDimensional({
        data,
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK,
      });

      expect(result.data).toEqual(data);
      expect(result.wasTruncated).toBe(false);
    });
  });

  describe('DAY granularity gap filling', () => {
    it('should fill missing date-secondary combinations with zero values', () => {
      const data = [
        { groupByDimensionValues: ['2024-01-01', 'A'], aggregateValue: 5 },
        { groupByDimensionValues: ['2024-01-03', 'A'], aggregateValue: 3 },
        { groupByDimensionValues: ['2024-01-01', 'B'], aggregateValue: 2 },
      ];

      const result = fillDateGapsTwoDimensional({
        data,
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
      });

      expect(result.data).toHaveLength(6);
      expect(result.wasTruncated).toBe(false);

      // Check that all dates have both secondary values
      const day1A = result.data.find(
        (d) =>
          d.groupByDimensionValues[0] === '2024-01-01' &&
          d.groupByDimensionValues[1] === 'A',
      );
      const day1B = result.data.find(
        (d) =>
          d.groupByDimensionValues[0] === '2024-01-01' &&
          d.groupByDimensionValues[1] === 'B',
      );
      const day2A = result.data.find(
        (d) =>
          d.groupByDimensionValues[0] === '2024-01-02' &&
          d.groupByDimensionValues[1] === 'A',
      );
      const day2B = result.data.find(
        (d) =>
          d.groupByDimensionValues[0] === '2024-01-02' &&
          d.groupByDimensionValues[1] === 'B',
      );

      expect(day1A?.aggregateValue).toBe(5);
      expect(day1B?.aggregateValue).toBe(2);
      expect(day2A?.aggregateValue).toBe(0);
      expect(day2B?.aggregateValue).toBe(0);
    });

    it('should handle null secondary dimension values', () => {
      const data = [
        { groupByDimensionValues: ['2024-01-01', null], aggregateValue: 5 },
        { groupByDimensionValues: ['2024-01-03', null], aggregateValue: 3 },
      ];

      const result = fillDateGapsTwoDimensional({
        data,
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
      });

      expect(result.data).toHaveLength(3);

      const day2Null = result.data.find(
        (d) =>
          d.groupByDimensionValues[0] === '2024-01-02' &&
          d.groupByDimensionValues[1] === null,
      );

      expect(day2Null?.aggregateValue).toBe(0);
    });

    it('should handle descending order', () => {
      const data = [
        { groupByDimensionValues: ['2024-01-03', 'A'], aggregateValue: 3 },
        { groupByDimensionValues: ['2024-01-01', 'A'], aggregateValue: 5 },
      ];

      const result = fillDateGapsTwoDimensional({
        data,
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        isDescOrder: true,
      });

      expect(result.data).toHaveLength(3);
      expect(result.data[0].groupByDimensionValues[0]).toBe('2024-01-03');
      expect(result.data[1].groupByDimensionValues[0]).toBe('2024-01-02');
      expect(result.data[2].groupByDimensionValues[0]).toBe('2024-01-01');
    });
  });
});
