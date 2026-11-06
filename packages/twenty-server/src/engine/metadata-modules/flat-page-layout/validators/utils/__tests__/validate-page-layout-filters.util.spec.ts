import {
  type PageLayoutFilter,
  PageLayoutFilterType,
  PageLayoutType,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { validatePageLayoutFilters } from 'src/engine/metadata-modules/flat-page-layout/validators/utils/validate-page-layout-filters.util';

const PERIOD_FILTER: PageLayoutFilter = {
  id: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e01',
  label: 'Period',
  type: PageLayoutFilterType.DATE,
  position: 0,
  defaultValue: {
    conditions: [
      { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_1_MONTH' },
    ],
  },
};

const CLOSE_DATE_FILTER: PageLayoutFilter = {
  id: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e02',
  label: 'Close date',
  type: PageLayoutFilterType.DATE,
  position: 1,
  defaultValue: null,
};

const validateDashboardFilters = (filters: PageLayoutFilter[]) =>
  validatePageLayoutFilters({ filters, type: PageLayoutType.DASHBOARD });

describe('validatePageLayoutFilters', () => {
  it('should accept a layout without filters whatever its type', () => {
    expect(
      validatePageLayoutFilters({
        filters: null,
        type: PageLayoutType.RECORD_PAGE,
      }),
    ).toEqual([]);
  });

  it('should accept valid filters on a dashboard', () => {
    expect(
      validateDashboardFilters([PERIOD_FILTER, CLOSE_DATE_FILTER]),
    ).toEqual([]);
  });

  it.each([
    PageLayoutType.RECORD_PAGE,
    PageLayoutType.RECORD_INDEX,
    PageLayoutType.STANDALONE_PAGE,
    PageLayoutType.RECORD_FORM,
  ])('should reject filters on a %s layout', (type) => {
    const errors = validatePageLayoutFilters({
      filters: [PERIOD_FILTER],
      type,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('only supported on dashboard');
  });

  it('should accept an empty filter list on a dashboard', () => {
    expect(
      validatePageLayoutFilters({
        filters: [],
        type: PageLayoutType.DASHBOARD,
      }),
    ).toEqual([]);
  });

  it('should reject an id that is not a UUID', () => {
    const errors = validateDashboardFilters([
      { ...PERIOD_FILTER, id: 'period' },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('is not a valid UUID');
  });

  it('should reject two filters sharing an id once', () => {
    const errors = validateDashboardFilters([
      PERIOD_FILTER,
      { ...CLOSE_DATE_FILTER, id: PERIOD_FILTER.id },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('is used by more than one filter');
  });

  it.each(['', '   '])('should reject the label %p', (label) => {
    const errors = validateDashboardFilters([{ ...PERIOD_FILTER, label }]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('has an empty label');
  });

  it('should reject an invalid default value', () => {
    const errors = validateDashboardFilters([
      {
        ...PERIOD_FILTER,
        defaultValue: {
          conditions: [
            { operand: ViewFilterOperand.IS_RELATIVE, value: 'last month' },
          ],
        },
      },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('"Period"');
  });
});
