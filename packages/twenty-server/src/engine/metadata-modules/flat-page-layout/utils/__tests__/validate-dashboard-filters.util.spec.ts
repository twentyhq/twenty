import {
  type DashboardFilterSlot,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { validateDashboardFilters } from 'src/engine/metadata-modules/flat-page-layout/utils/validate-dashboard-filters.util';

const DATE_SLOT: DashboardFilterSlot = {
  id: 'date',
  label: 'Date',
  filterType: 'DATE_TIME',
  defaultOperand: ViewFilterOperand.IS_RELATIVE,
  defaultValue: 'THIS_1_MONTH',
};

const OWNER_SLOT: DashboardFilterSlot = {
  id: 'owner',
  label: 'Owner',
  filterType: 'RELATION',
};

describe('validateDashboardFilters', () => {
  it('should accept null, undefined and an empty list', () => {
    expect(validateDashboardFilters(null)).toEqual([]);
    expect(validateDashboardFilters(undefined)).toEqual([]);
    expect(validateDashboardFilters([])).toEqual([]);
  });

  it('should accept well-formed slots', () => {
    expect(validateDashboardFilters([DATE_SLOT, OWNER_SLOT])).toEqual([]);
  });

  it('should reject a non-array payload', () => {
    const errors = validateDashboardFilters(
      {} as unknown as DashboardFilterSlot[],
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('INVALID_PAGE_LAYOUT_DATA');
    expect(errors[0].message).toContain('must be an array');
  });

  it('should reject a slot that is not an object', () => {
    const errors = validateDashboardFilters([
      'date' as unknown as DashboardFilterSlot,
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('is not an object');
  });

  it('should reject duplicate slot ids', () => {
    const errors = validateDashboardFilters([
      DATE_SLOT,
      { ...OWNER_SLOT, id: 'date' },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('INVALID_PAGE_LAYOUT_DATA');
    expect(errors[0].message).toContain('"date" is used more than once');
  });

  it('should reject an empty slot id', () => {
    const errors = validateDashboardFilters([{ ...DATE_SLOT, id: '' }]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('has no id');
  });

  it('should reject an empty label', () => {
    const errors = validateDashboardFilters([{ ...DATE_SLOT, label: '' }]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('has no label');
  });

  it('should reject a filter type that is not filterable', () => {
    const errors = validateDashboardFilters([
      {
        ...DATE_SLOT,
        filterType: 'RICH_TEXT' as DashboardFilterSlot['filterType'],
      },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('"RICH_TEXT"');
    expect(errors[0].message).toContain('is not filterable');
  });

  it('should reject the TS_VECTOR filter type since no chip can render it', () => {
    const errors = validateDashboardFilters([
      { ...DATE_SLOT, filterType: 'TS_VECTOR' },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].value).toBe('TS_VECTOR');
  });

  it('should reject an unknown default operand', () => {
    const errors = validateDashboardFilters([
      {
        ...DATE_SLOT,
        defaultOperand: 'NOT_AN_OPERAND' as ViewFilterOperand,
      },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('"NOT_AN_OPERAND"');
    expect(errors[0].message).toContain('is not a known operand');
  });

  it('should accept a null default operand', () => {
    expect(
      validateDashboardFilters([{ ...DATE_SLOT, defaultOperand: null }]),
    ).toEqual([]);
  });

  it('should report every problem of a slot at once', () => {
    const errors = validateDashboardFilters([
      {
        id: '',
        label: '',
        filterType: 'UNKNOWN' as DashboardFilterSlot['filterType'],
        defaultOperand: 'NOPE' as ViewFilterOperand,
      },
    ]);

    expect(errors).toHaveLength(4);
  });
});
