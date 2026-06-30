import { Temporal } from 'temporal-polyfill';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';

import { BAR_CHART_MAXIMUM_NUMBER_OF_BARS } from 'src/modules/dashboard/chart-data/constants/bar-chart-maximum-number-of-bars.constant';
import { generateDateGroupsInRange } from 'src/modules/dashboard/chart-data/utils/generate-date-groups-in-range.util';

describe('generateDateGroupsInRange', () => {
  describe('DAY granularity', () => {
    it('should generate daily dates in range', () => {
      const result = generateDateGroupsInRange({
        startDate: Temporal.PlainDate.from('2024-01-01'),
        endDate: Temporal.PlainDate.from('2024-01-05'),
        granularity: ObjectRecordGroupByDateGranularity.DAY,
      });

      expect(result.dates).toHaveLength(5);
      expect(result.wasTruncated).toBe(false);
      expect(result.dates[0].toString()).toBe('2024-01-01');
      expect(result.dates[4].toString()).toBe('2024-01-05');
    });

    it('should return single date when start equals end', () => {
      const result = generateDateGroupsInRange({
        startDate: Temporal.PlainDate.from('2024-01-01'),
        endDate: Temporal.PlainDate.from('2024-01-01'),
        granularity: ObjectRecordGroupByDateGranularity.DAY,
      });

      expect(result.dates).toHaveLength(1);
      expect(result.wasTruncated).toBe(false);
      expect(result.dates[0].toString()).toBe('2024-01-01');
    });
  });

  describe('WEEK granularity', () => {
    it('should generate weekly dates in range', () => {
      const result = generateDateGroupsInRange({
        startDate: Temporal.PlainDate.from('2024-01-01'),
        endDate: Temporal.PlainDate.from('2024-01-29'),
        granularity: ObjectRecordGroupByDateGranularity.WEEK,
      });

      expect(result.dates).toHaveLength(5);
      expect(result.wasTruncated).toBe(false);
      expect(result.dates[0].toString()).toBe('2024-01-01');
      expect(result.dates[1].toString()).toBe('2024-01-08');
      expect(result.dates[2].toString()).toBe('2024-01-15');
      expect(result.dates[3].toString()).toBe('2024-01-22');
      expect(result.dates[4].toString()).toBe('2024-01-29');
    });
  });

  describe('MONTH granularity', () => {
    it('should generate monthly dates in range', () => {
      const result = generateDateGroupsInRange({
        startDate: Temporal.PlainDate.from('2024-01-01'),
        endDate: Temporal.PlainDate.from('2024-04-01'),
        granularity: ObjectRecordGroupByDateGranularity.MONTH,
      });

      expect(result.dates).toHaveLength(4);
      expect(result.wasTruncated).toBe(false);
      expect(result.dates[0].toString()).toBe('2024-01-01');
      expect(result.dates[1].toString()).toBe('2024-02-01');
      expect(result.dates[2].toString()).toBe('2024-03-01');
      expect(result.dates[3].toString()).toBe('2024-04-01');
    });

    it('should handle year boundaries', () => {
      const result = generateDateGroupsInRange({
        startDate: Temporal.PlainDate.from('2023-11-01'),
        endDate: Temporal.PlainDate.from('2024-02-01'),
        granularity: ObjectRecordGroupByDateGranularity.MONTH,
      });

      expect(result.dates).toHaveLength(4);
      expect(result.dates[0].toString()).toBe('2023-11-01');
      expect(result.dates[1].toString()).toBe('2023-12-01');
      expect(result.dates[2].toString()).toBe('2024-01-01');
      expect(result.dates[3].toString()).toBe('2024-02-01');
    });
  });

  describe('QUARTER granularity', () => {
    it('should generate quarterly dates in range', () => {
      const result = generateDateGroupsInRange({
        startDate: Temporal.PlainDate.from('2024-01-01'),
        endDate: Temporal.PlainDate.from('2024-10-01'),
        granularity: ObjectRecordGroupByDateGranularity.QUARTER,
      });

      expect(result.dates).toHaveLength(4);
      expect(result.wasTruncated).toBe(false);
      expect(result.dates[0].toString()).toBe('2024-01-01');
      expect(result.dates[1].toString()).toBe('2024-04-01');
      expect(result.dates[2].toString()).toBe('2024-07-01');
      expect(result.dates[3].toString()).toBe('2024-10-01');
    });
  });

  describe('YEAR granularity', () => {
    it('should generate yearly dates in range', () => {
      const result = generateDateGroupsInRange({
        startDate: Temporal.PlainDate.from('2020-01-01'),
        endDate: Temporal.PlainDate.from('2024-01-01'),
        granularity: ObjectRecordGroupByDateGranularity.YEAR,
      });

      expect(result.dates).toHaveLength(5);
      expect(result.wasTruncated).toBe(false);
      expect(result.dates[0].toString()).toBe('2020-01-01');
      expect(result.dates[1].toString()).toBe('2021-01-01');
      expect(result.dates[2].toString()).toBe('2022-01-01');
      expect(result.dates[3].toString()).toBe('2023-01-01');
      expect(result.dates[4].toString()).toBe('2024-01-01');
    });
  });

  describe('truncation', () => {
    it('should truncate when exceeding maximum number of bars', () => {
      const startDate = Temporal.PlainDate.from('2020-01-01');
      const endDate = startDate.add({
        days: BAR_CHART_MAXIMUM_NUMBER_OF_BARS + 50,
      });

      const result = generateDateGroupsInRange({
        startDate,
        endDate,
        granularity: ObjectRecordGroupByDateGranularity.DAY,
      });

      expect(result.dates).toHaveLength(BAR_CHART_MAXIMUM_NUMBER_OF_BARS);
      expect(result.wasTruncated).toBe(true);
    });

    it('should not truncate when exactly at maximum', () => {
      const startDate = Temporal.PlainDate.from('2020-01-01');
      const endDate = startDate.add({
        days: BAR_CHART_MAXIMUM_NUMBER_OF_BARS - 1,
      });

      const result = generateDateGroupsInRange({
        startDate,
        endDate,
        granularity: ObjectRecordGroupByDateGranularity.DAY,
      });

      expect(result.dates).toHaveLength(BAR_CHART_MAXIMUM_NUMBER_OF_BARS);
      expect(result.wasTruncated).toBe(false);
    });
  });
});
