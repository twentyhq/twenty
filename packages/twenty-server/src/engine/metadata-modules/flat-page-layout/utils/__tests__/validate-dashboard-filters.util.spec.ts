import {
  type DashboardFilterSlot,
  PageLayoutType,
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

const validate = (
  dashboardFilters: DashboardFilterSlot[] | null | undefined,
  pageLayoutType: PageLayoutType = PageLayoutType.DASHBOARD,
) => validateDashboardFilters({ dashboardFilters, pageLayoutType });

describe('validateDashboardFilters', () => {
  it('should accept null, undefined and an empty list', () => {
    expect(validate(null)).toEqual([]);
    expect(validate(undefined)).toEqual([]);
    expect(validate([])).toEqual([]);
  });

  it('should accept well-formed slots', () => {
    expect(validate([DATE_SLOT, OWNER_SLOT])).toEqual([]);
  });

  it('should accept null slots on any layout type', () => {
    expect(validate(null, PageLayoutType.RECORD_PAGE)).toEqual([]);
  });

  it('should reject slots on a layout that is not a dashboard', () => {
    const errors = validate([DATE_SLOT], PageLayoutType.RECORD_PAGE);

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('INVALID_PAGE_LAYOUT_DATA');
    expect(errors[0].message).toContain('RECORD_PAGE');
    expect(errors[0].userFriendlyMessage).toBeDefined();
  });

  it('should reject a non-array payload', () => {
    const errors = validate({} as unknown as DashboardFilterSlot[]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('must be an array');
  });

  it('should reject more than 20 slots', () => {
    const errors = validate(
      Array.from({ length: 21 }, (_, index) => ({
        ...OWNER_SLOT,
        id: `slot-${index}`,
      })),
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('at most 20');
  });

  it('should reject a slot that is not an object', () => {
    const errors = validate(['date' as unknown as DashboardFilterSlot]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('is not an object');
  });

  it('should reject duplicate slot ids', () => {
    const errors = validate([DATE_SLOT, { ...OWNER_SLOT, id: 'date' }]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('"date" is used more than once');
  });

  it.each(['', 'has space', 'slot/1', 'a'.repeat(65), 'émoji'])(
    'should reject the slot id %p',
    (id) => {
      const errors = validate([{ ...DATE_SLOT, id }]);

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('must be 1 to 64');
    },
  );

  it('should accept slot ids made of letters, digits, underscores and dashes', () => {
    expect(validate([{ ...DATE_SLOT, id: 'Closing_month-2' }])).toEqual([]);
  });

  it('should reject an empty label', () => {
    const errors = validate([{ ...DATE_SLOT, label: '' }]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('has no label');
  });

  it('should reject a label longer than 100 characters', () => {
    const errors = validate([{ ...DATE_SLOT, label: 'a'.repeat(101) }]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('exceeds 100 characters');
  });

  it('should reject a filter type that is not filterable', () => {
    const errors = validate([
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
    // Deliberately malformed input: the slot type no longer admits TS_VECTOR at compile time.
    const searchVectorSlot = {
      ...DATE_SLOT,
      filterType: 'TS_VECTOR',
    } as unknown as DashboardFilterSlot;

    const errors = validate([searchVectorSlot]);

    expect(errors).toHaveLength(1);
    expect(errors[0].value).toBe('TS_VECTOR');
  });

  it('should reject an unknown default operand', () => {
    const errors = validate([
      { ...DATE_SLOT, defaultOperand: 'NOT_AN_OPERAND' as ViewFilterOperand },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('"NOT_AN_OPERAND"');
    expect(errors[0].message).toContain('is not a known operand');
  });

  it('should reject a default operand that the filter type does not support', () => {
    const errors = validate([
      {
        ...OWNER_SLOT,
        defaultOperand: ViewFilterOperand.IS_RELATIVE,
      },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('"IS_RELATIVE"');
    expect(errors[0].message).toContain(
      'is not supported on filter type "RELATION"',
    );
  });

  it('should accept a null default operand on a slot without a default value', () => {
    expect(validate([{ ...OWNER_SLOT, defaultOperand: null }])).toEqual([]);
  });

  it('should reject a default value without a default operand', () => {
    const errors = validate([{ ...OWNER_SLOT, defaultValue: '["some-id"]' }]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('no default operand');
  });

  it('should reject a default value that is not valid for the operand', () => {
    const errors = validate([
      {
        ...DATE_SLOT,
        defaultValue: JSON.stringify({
          direction: 'NEXT',
          amount: 30,
          unit: 'DAY',
        }),
      },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain(
      'is not valid for operand "IS_RELATIVE"',
    );
  });

  it('should accept a valid default value for the operand', () => {
    expect(
      validate([
        {
          ...DATE_SLOT,
          defaultOperand: ViewFilterOperand.IS_RELATIVE,
          defaultValue: 'PAST_7_DAY',
        },
      ]),
    ).toEqual([]);
  });

  it('should report every problem of a slot at once', () => {
    const errors = validate([
      {
        id: '',
        label: '',
        filterType: 'UNKNOWN' as DashboardFilterSlot['filterType'],
      },
    ]);

    expect(errors).toHaveLength(3);
  });
});
