import { Temporal } from 'temporal-polyfill';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';

import { generateDateGroupsCoveringRange } from 'src/modules/dashboard/chart-data/utils/generate-date-groups-covering-range.util';

const generateMonths = (
  dateRange: Parameters<typeof generateDateGroupsCoveringRange>[0]['dateRange'],
  maximumNumberOfDateGroups = 100,
) => {
  const { dates, wasTruncated } = generateDateGroupsCoveringRange({
    minDate: Temporal.PlainDate.from('2024-03-01'),
    maxDate: Temporal.PlainDate.from('2024-04-01'),
    dateRange,
    granularity: ObjectRecordGroupByDateGranularity.MONTH,
    maximumNumberOfDateGroups,
  });

  return { dates: dates.map((date) => date.toString()), wasTruncated };
};

describe('generateDateGroupsCoveringRange', () => {
  it('should cover the data alone without a range', () => {
    expect(generateMonths(undefined)).toEqual({
      dates: ['2024-03-01', '2024-04-01'],
      wasTruncated: false,
    });
  });

  it('should extend the axis to the bounded sides of the range', () => {
    expect(
      generateMonths({
        start: Temporal.PlainDate.from('2024-01-01'),
        end: Temporal.PlainDate.from('2024-06-01'),
      }).dates,
    ).toEqual([
      '2024-01-01',
      '2024-02-01',
      '2024-03-01',
      '2024-04-01',
      '2024-05-01',
      '2024-06-01',
    ]);
  });

  it('should never shrink the axis below the data', () => {
    expect(
      generateMonths({
        start: Temporal.PlainDate.from('2024-04-01'),
        end: Temporal.PlainDate.from('2024-03-01'),
      }).dates,
    ).toEqual(['2024-03-01', '2024-04-01']);
  });

  it('should fall back to the data when the range exceeds the bucket cap', () => {
    expect(
      generateMonths({
        start: Temporal.PlainDate.from('2000-01-01'),
        end: null,
      }),
    ).toEqual({ dates: ['2024-03-01', '2024-04-01'], wasTruncated: false });
  });

  it('should fall back to the data when the range exceeds a smaller budget', () => {
    expect(
      generateMonths(
        {
          start: Temporal.PlainDate.from('2024-01-01'),
          end: Temporal.PlainDate.from('2024-04-01'),
        },
        3,
      ).dates,
    ).toEqual(['2024-03-01', '2024-04-01']);
  });
});
