import { DASHBOARD_DATE_RANGE_FILTER } from 'twenty-shared/constants';
import {
  type PageLayoutFilter,
  PageLayoutType,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { validatePageLayoutFilters } from 'src/engine/metadata-modules/flat-page-layout/validators/utils/validate-page-layout-filters.util';

const PERIOD_FILTER: PageLayoutFilter = {
  ...DASHBOARD_DATE_RANGE_FILTER,
  defaultValue: {
    conditions: [
      { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_1_MONTH' },
    ],
  },
};

const CLOSE_DATE_FILTER: PageLayoutFilter = {
  ...DASHBOARD_DATE_RANGE_FILTER,
  id: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e02',
  label: 'Close date',
};

const validateDashboardFilters = (filters: unknown) =>
  validatePageLayoutFilters({ filters, type: PageLayoutType.DASHBOARD });

const withCondition = (condition: unknown) => [
  { ...PERIOD_FILTER, defaultValue: { conditions: [condition] } },
];

describe('validatePageLayoutFilters', () => {
  it.each([null, []])(
    'should accept %p as no filters on a record page layout',
    (filters) => {
      expect(
        validatePageLayoutFilters({
          filters,
          type: PageLayoutType.RECORD_PAGE,
        }),
      ).toEqual([]);
    },
  );

  it.each([
    ['with a default value', PERIOD_FILTER],
    ['without a default value', DASHBOARD_DATE_RANGE_FILTER],
  ])('should accept the built-in Date range filter %s', (_case, filter) => {
    expect(validateDashboardFilters([filter])).toEqual([]);
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

  it.each([
    ['filters that are not an array', { 0: PERIOD_FILTER }],
    ['filters that are a string', 'Period'],
    ['a null filter', [null]],
    ['a filter that is an array', [[PERIOD_FILTER]]],
    ['a numeric id', [{ ...PERIOD_FILTER, id: 1 }]],
    ['a null label', [{ ...PERIOD_FILTER, label: null }]],
    ['a missing position', [{ ...PERIOD_FILTER, position: undefined }]],
    ['a string position', [{ ...PERIOD_FILTER, position: 'first' }]],
    ['an infinite position', [{ ...PERIOD_FILTER, position: Infinity }]],
    ['an unsupported type', [{ ...PERIOD_FILTER, type: 'SELECT' }]],
    ['a constructor type', [{ ...PERIOD_FILTER, type: 'constructor' }]],
    ['a toString type', [{ ...PERIOD_FILTER, type: 'toString' }]],
    ['a __proto__ type', [{ ...PERIOD_FILTER, type: '__proto__' }]],
    [
      'a missing default value',
      [{ ...PERIOD_FILTER, defaultValue: undefined }],
    ],
    [
      'conditions that are not an array',
      [{ ...PERIOD_FILTER, defaultValue: { conditions: 'PAST_1_MONTH' } }],
    ],
    ['a null condition', withCondition(null)],
    ['an unknown operand', withCondition({ operand: 'BETWEEN', value: '' })],
    [
      'a condition value that is an array',
      withCondition({
        operand: ViewFilterOperand.IS_AFTER,
        value: ['2026-01-01'],
      }),
    ],
    ['an unknown filter key', [{ ...PERIOD_FILTER, secret: 'token' }]],
    [
      'an unknown default value key',
      [
        {
          ...PERIOD_FILTER,
          defaultValue: { ...PERIOD_FILTER.defaultValue, secret: 'token' },
        },
      ],
    ],
    [
      'an unknown condition key',
      withCondition({
        operand: ViewFilterOperand.IS_RELATIVE,
        value: 'PAST_1_MONTH',
        __typename: 'PageLayoutFilterCondition',
      }),
    ],
  ])('should report %s as malformed without throwing', (_case, filters) => {
    const errors = validateDashboardFilters(filters);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('Dashboard filters are malformed');
  });

  it('should locate an issue inside the filters', () => {
    const errors = validateDashboardFilters([
      { ...PERIOD_FILTER, label: null },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /^Dashboard filters are malformed at "0\.label": /,
    );
  });

  it('should not locate an issue at the root of the filters', () => {
    const errors = validateDashboardFilters('Period');

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/^Dashboard filters are malformed: /);
  });

  it.each([
    ['another filter', [CLOSE_DATE_FILTER]],
    ['a filter that is not a UUID', [{ ...PERIOD_FILTER, id: 'period' }]],
    ['a second filter', [PERIOD_FILTER, CLOSE_DATE_FILTER]],
    ['the built-in filter twice', [PERIOD_FILTER, PERIOD_FILTER]],
  ])('should reject %s once', (_case, filters) => {
    const errors = validateDashboardFilters(filters);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain(
      'Dashboards only support the built-in Date range filter',
    );
  });

  it('should reject an invalid default value', () => {
    const errors = validateDashboardFilters(
      withCondition({
        operand: ViewFilterOperand.IS_RELATIVE,
        value: 'last month',
      }),
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('"Date range"');
  });
});
