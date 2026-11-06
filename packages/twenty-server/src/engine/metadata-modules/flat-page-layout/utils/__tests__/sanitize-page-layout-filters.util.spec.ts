import {
  type PageLayoutFilter,
  PageLayoutFilterType,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { fastDeepEqual } from 'twenty-shared/utils';

import { sanitizePageLayoutFilters } from 'src/engine/metadata-modules/flat-page-layout/utils/sanitize-page-layout-filters.util';

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

const withNullPrototype = <TValue extends object>(value: TValue): TValue =>
  Object.assign(Object.create(null), value);

describe('sanitizePageLayoutFilters', () => {
  it('should keep null as null', () => {
    expect(sanitizePageLayoutFilters(null)).toBeNull();
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
});
