import {
  type DashboardFilterSlot,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { validateDashboardFilterSlots } from 'src/engine/metadata-modules/flat-page-layout/utils/validate-dashboard-filter-slots.util';
import { PageLayoutExceptionCode } from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';

const DATE_SLOT: DashboardFilterSlot = {
  id: 'date',
  label: 'Date',
  filterType: 'DATE_TIME',
};

const OWNER_SLOT: DashboardFilterSlot = {
  id: 'owner',
  label: 'Owner',
  filterType: 'RELATION',
  isRequired: false,
  defaultValue: null,
};

const getMessages = (dashboardFilters: unknown) =>
  validateDashboardFilterSlots(dashboardFilters).map(({ message }) => message);

describe('validateDashboardFilterSlots', () => {
  it('should accept null and undefined', () => {
    expect(validateDashboardFilterSlots(null)).toEqual([]);
    expect(validateDashboardFilterSlots(undefined)).toEqual([]);
  });

  it('should accept an empty array', () => {
    expect(validateDashboardFilterSlots([])).toEqual([]);
  });

  it('should accept well-formed slots', () => {
    expect(validateDashboardFilterSlots([DATE_SLOT, OWNER_SLOT])).toEqual([]);
  });

  it('should accept a default value whose operand is allowed for the filter type', () => {
    expect(
      validateDashboardFilterSlots([
        {
          ...DATE_SLOT,
          defaultValue: {
            operand: ViewFilterOperand.IS_NOT_EMPTY,
            value: '',
          },
        },
      ]),
    ).toEqual([]);
  });

  it('should reject a value that is not an array', () => {
    expect(getMessages({ id: 'date' })).toEqual([
      'Dashboard filters must be an array',
    ]);
  });

  it('should reject a slot that is not an object', () => {
    expect(getMessages(['date'])).toEqual([
      'Dashboard filter at index 0 must be an object',
    ]);
  });

  it('should reject a slot without an id', () => {
    expect(getMessages([{ ...DATE_SLOT, id: '' }])).toEqual([
      'Dashboard filter at index 0 must have a non-empty id',
    ]);
  });

  it('should reject a slot without a label', () => {
    expect(getMessages([{ ...DATE_SLOT, label: '   ' }])).toEqual([
      'Dashboard filter "date" must have a non-empty label',
    ]);
  });

  it('should reject an unknown filter type', () => {
    expect(getMessages([{ ...DATE_SLOT, filterType: 'NUMBER' }])).toEqual([
      'Dashboard filter "date" filter type must be one of DATE, DATE_TIME, RELATION, SELECT, MULTI_SELECT, TEXT, BOOLEAN',
    ]);
  });

  it('should reject a non-boolean isRequired', () => {
    expect(getMessages([{ ...DATE_SLOT, isRequired: 'yes' }])).toEqual([
      'Dashboard filter "date" isRequired must be a boolean',
    ]);
  });

  it('should reject duplicated slot ids', () => {
    expect(getMessages([DATE_SLOT, { ...OWNER_SLOT, id: 'date' }])).toEqual([
      'Dashboard filter ids must be unique, found duplicates: date',
    ]);
  });

  it('should reject a default value whose operand is not allowed for the filter type', () => {
    expect(
      getMessages([
        {
          ...DATE_SLOT,
          defaultValue: { operand: ViewFilterOperand.CONTAINS, value: 'a' },
        },
      ]),
    ).toEqual([
      'Dashboard filter "date" default value operand "CONTAINS" is not allowed for filter type "DATE_TIME"',
    ]);
  });

  it('should reject a default value whose value does not match its operand', () => {
    expect(
      getMessages([
        {
          ...DATE_SLOT,
          defaultValue: { operand: ViewFilterOperand.IS, value: 'not-a-date' },
        },
      ]),
    ).toEqual([
      'Dashboard filter "date" default value is invalid for filter type "DATE_TIME"',
    ]);
  });

  it('should reject a malformed default value', () => {
    expect(getMessages([{ ...DATE_SLOT, defaultValue: 'tomorrow' }])).toEqual([
      'Dashboard filter "date" default value must have a string operand and a string value',
    ]);
  });

  it('should report every problem of a slot with the invalid page layout data code', () => {
    const errors = validateDashboardFilterSlots([
      { id: '', label: '', filterType: 'NUMBER' },
    ]);

    expect(errors).toHaveLength(3);
    expect(
      errors.every(
        ({ code }) => code === PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
      ),
    ).toBe(true);
  });
});
