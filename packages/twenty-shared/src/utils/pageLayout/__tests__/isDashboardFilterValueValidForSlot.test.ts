import { type DashboardFilterSlot, ViewFilterOperand } from '@/types';
import { isDashboardFilterValueValidForSlot } from '@/utils/pageLayout/isDashboardFilterValueValidForSlot';

const DATE_TIME_SLOT: DashboardFilterSlot = {
  id: 'date',
  label: 'Date',
  filterType: 'DATE_TIME',
};

const RELATION_SLOT: DashboardFilterSlot = {
  id: 'owner',
  label: 'Owner',
  filterType: 'RELATION',
};

const WORKSPACE_MEMBER_ID = '20202020-0687-4c41-b707-ed1bfca972a7';

const CURRENT_WORKSPACE_MEMBER_RELATION_VALUE = JSON.stringify({
  isCurrentWorkspaceMemberSelected: true,
  selectedRecordIds: [],
});

const SELECTED_RECORDS_RELATION_VALUE = JSON.stringify({
  isCurrentWorkspaceMemberSelected: false,
  selectedRecordIds: [WORKSPACE_MEMBER_ID],
});

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

  it.each([
    [ViewFilterOperand.IS, CURRENT_WORKSPACE_MEMBER_RELATION_VALUE],
    [ViewFilterOperand.IS_NOT, CURRENT_WORKSPACE_MEMBER_RELATION_VALUE],
    [ViewFilterOperand.IS, SELECTED_RECORDS_RELATION_VALUE],
    [ViewFilterOperand.IS_EMPTY, ''],
  ])('accepts %s with %p on a RELATION slot', (operand, value) => {
    expect(
      isDashboardFilterValueValidForSlot({
        slot: RELATION_SLOT,
        value: { operand, value },
      }),
    ).toBe(true);
  });

  it.each([
    ['an operand the slot type does not offer', ViewFilterOperand.IS_TODAY, ''],
    [
      'a relation value selecting nothing',
      ViewFilterOperand.IS,
      JSON.stringify({
        isCurrentWorkspaceMemberSelected: false,
        selectedRecordIds: [],
      }),
    ],
    [
      'a relation value with a non-uuid record id',
      ViewFilterOperand.IS,
      JSON.stringify({
        isCurrentWorkspaceMemberSelected: false,
        selectedRecordIds: ['not-a-uuid'],
      }),
    ],
    ['a value that is not JSON', ViewFilterOperand.IS, '{bad'],
    ['an empty value on a value-expecting operand', ViewFilterOperand.IS, ''],
  ])('rejects %s on a RELATION slot', (_label, operand, value) => {
    expect(
      isDashboardFilterValueValidForSlot({
        slot: RELATION_SLOT,
        value: { operand, value },
      }),
    ).toBe(false);
  });
});
