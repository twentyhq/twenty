import { DASHBOARD_DATE_RANGE_FILTER } from '@/constants/DashboardDateRangeFilter';
import {
  type PageLayoutFilter,
  PageLayoutFilterType,
  ViewFilterOperand,
} from '@/types';
import { getEffectiveDashboardPageLayoutFilters } from '@/utils/pageLayout/getEffectiveDashboardPageLayoutFilters';

describe('getEffectiveDashboardPageLayoutFilters', () => {
  it.each([null, undefined, []])(
    'should return the built-in Date range filter when the stored filters are %p',
    (filters) => {
      expect(getEffectiveDashboardPageLayoutFilters(filters)).toEqual([
        DASHBOARD_DATE_RANGE_FILTER,
      ]);
    },
  );

  it('should return the stored filters when there are some', () => {
    const storedFilters: PageLayoutFilter[] = [
      {
        ...DASHBOARD_DATE_RANGE_FILTER,
        defaultValue: {
          conditions: [
            { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01' },
          ],
        },
      },
    ];

    expect(getEffectiveDashboardPageLayoutFilters(storedFilters)).toBe(
      storedFilters,
    );
  });

  it('should define the built-in filter as an empty Date range', () => {
    expect(DASHBOARD_DATE_RANGE_FILTER).toEqual({
      id: '20202020-7a1e-4b6f-9c3d-0d2f6e8a1b01',
      label: 'Date range',
      type: PageLayoutFilterType.DATE,
      position: 0,
      defaultValue: null,
    });
  });
});
