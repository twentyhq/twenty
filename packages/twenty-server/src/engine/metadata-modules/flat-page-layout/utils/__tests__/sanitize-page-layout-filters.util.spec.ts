import { DASHBOARD_DATE_RANGE_FILTER } from 'twenty-shared/constants';
import { type PageLayoutFilter, ViewFilterOperand } from 'twenty-shared/types';
import { fastDeepEqual } from 'twenty-shared/utils';

import { sanitizePageLayoutFilters } from 'src/engine/metadata-modules/flat-page-layout/utils/sanitize-page-layout-filters.util';

const PERIOD_FILTER: PageLayoutFilter = {
  ...DASHBOARD_DATE_RANGE_FILTER,
  defaultValue: {
    conditions: [
      { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_1_MONTH' },
    ],
  },
};

const withNullPrototype = <TValue extends object>(value: TValue): TValue =>
  Object.assign(Object.create(null), value);

describe('sanitizePageLayoutFilters', () => {
  it.each([null, []])('should turn %p into null', (filters) => {
    expect(sanitizePageLayoutFilters(filters)).toBeNull();
  });

  it('should rebuild null-prototype GraphQL input objects as plain objects', () => {
    const graphqlInputFilter = withNullPrototype({
      ...PERIOD_FILTER,
      defaultValue: withNullPrototype({
        conditions: [
          withNullPrototype({
            operand: ViewFilterOperand.IS_RELATIVE,
            value: 'PAST_1_MONTH',
          }),
        ],
      }),
    });

    const sanitizedFilters = sanitizePageLayoutFilters([graphqlInputFilter]);

    expect(fastDeepEqual(sanitizedFilters, [PERIOD_FILTER])).toBe(true);
  });

  it('should turn an omitted default value into null', () => {
    const { defaultValue: _defaultValue, ...filterWithoutDefaultValue } =
      PERIOD_FILTER;

    expect(sanitizePageLayoutFilters([filterWithoutDefaultValue])).toEqual([
      { ...PERIOD_FILTER, defaultValue: null },
    ]);
  });

  it('should give the built-in Date range filter its own label and position', () => {
    expect(
      sanitizePageLayoutFilters([
        { ...PERIOD_FILTER, label: 'Quarter', position: 3 },
      ]),
    ).toEqual([PERIOD_FILTER]);
  });
});
