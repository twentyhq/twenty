import { evaluateConditionalAvailabilityExpression } from 'twenty-shared/utils';

import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const INBOX_COMMAND_MENU_ITEM_NAMES = [
  'markAiChatAsDone',
  'reopenAiChat',
  'unsnoozeAiChat',
  'snoozeAiChat',
] as const;

const getAvailableInboxCommands = (scope: 'INBOX' | 'SNOOZED' | 'ARCHIVED') =>
  INBOX_COMMAND_MENU_ITEM_NAMES.filter((name) =>
    evaluateConditionalAvailabilityExpression(
      STANDARD_COMMAND_MENU_ITEMS[name].conditionalAvailabilityExpression,
      {
        numberOfSelectedRecords: 1,
        permissionFlags: { AI: true },
        selectedRecords: [
          {
            id: 'thread-1',
            deletedAt: null,
            inboxStatus: { scope, isUnread: false, event: null },
          },
        ],
      },
    ),
  );

describe('AI chat inbox command menu items', () => {
  it('offers done and snooze on an open chat', () => {
    expect(getAvailableInboxCommands('INBOX')).toEqual([
      'markAiChatAsDone',
      'snoozeAiChat',
    ]);
  });

  it('offers only unsnooze on a snoozed chat', () => {
    expect(getAvailableInboxCommands('SNOOZED')).toEqual(['unsnoozeAiChat']);
  });

  it('offers reopen and snooze on a done chat', () => {
    expect(getAvailableInboxCommands('ARCHIVED')).toEqual([
      'reopenAiChat',
      'snoozeAiChat',
    ]);
  });
});
