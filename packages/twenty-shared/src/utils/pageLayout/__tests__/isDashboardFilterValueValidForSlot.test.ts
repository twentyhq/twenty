import { type DashboardFilterSlot, ViewFilterOperand } from '@/types';
import { isDashboardFilterValueValidForSlot } from '@/utils/pageLayout/isDashboardFilterValueValidForSlot';

const DATE_TIME_SLOT: DashboardFilterSlot = {
  id: 'date',
  label: 'Date',
  filterType: 'DATE_TIME',
};

describe('isDashboardFilterValueValidForSlot', () => {
  it.each([
    [ViewFilterOperand.IS_AFTER, '2024-01-01T00:00:00.000Z'],
    [ViewFilterOperand.IS, '2024-01-01'],
    [ViewFilterOperand.IS_TODAY, ''],
    [ViewFilterOperand.IS_RELATIVE, 'PAST_7_DAY'],
  ])('accepts %s with %p on a DATE_TIME slot', (operand, value) => {
    expect(
      isDashboardFilterValueValidForSlot({
        slot: DATE_TIME_SLOT,
        value: { operand, value },
      }),
    ).toBe(true);
  });

  it.each([
    [
      'an operand the slot type does not offer',
      ViewFilterOperand.CONTAINS,
      'x',
    ],
    ['a value that is not an instant', ViewFilterOperand.IS_AFTER, 'garbage'],
    ['a malformed relative date', ViewFilterOperand.IS_RELATIVE, '{bad'],
    [
      'an empty value on a value-expecting operand',
      ViewFilterOperand.IS_AFTER,
      '',
    ],
  ])('rejects %s', (_label, operand, value) => {
    expect(
      isDashboardFilterValueValidForSlot({
        slot: DATE_TIME_SLOT,
        value: { operand, value },
      }),
    ).toBe(false);
  });
});
