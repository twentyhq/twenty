import { evaluateConditionalAvailabilityExpression } from 'twenty-shared/utils';

import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const INBOX_COMMAND_MENU_ITEM_NAMES = [
  'markAiChatAsDone',
  'reopenAiChat',
  'unsnoozeAiChat',
  'snoozeAiChat',
] as const;

type InboxScope = 'INBOX' | 'SNOOZED' | 'ARCHIVED';

const getAvailableInboxCommands = (...scopes: InboxScope[]) =>
  INBOX_COMMAND_MENU_ITEM_NAMES.filter((name) =>
    evaluateConditionalAvailabilityExpression(
      STANDARD_COMMAND_MENU_ITEMS[name].conditionalAvailabilityExpression,
      {
        numberOfSelectedRecords: scopes.length,
        permissionFlags: { AI: true },
        selectedRecords: scopes.map((scope, index) => ({
          id: `thread-${index}`,
          deletedAt: null,
          inboxStatus: { scope, isUnread: false, event: null },
        })),
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

  it('offers done and snooze on several open chats', () => {
    expect(getAvailableInboxCommands('INBOX', 'INBOX')).toEqual([
      'markAiChatAsDone',
      'snoozeAiChat',
    ]);
  });

  it('offers only what every selected chat allows', () => {
    expect(getAvailableInboxCommands('INBOX', 'ARCHIVED')).toEqual([
      'snoozeAiChat',
    ]);
  });
});
