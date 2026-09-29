import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { type LinkChatMessageSendersToWorkspaceMembersCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790605326331-link-chat-message-senders-to-workspace-members.command';
import { type OpenAgentChatThreadArchivedAtWritabilityCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790672076234-open-agent-chat-thread-archived-at-writability.command';
import { type MoveAgentChatThreadsToRecordModelCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790710419702-move-agent-chat-threads-to-record-model.command';
import { type AddChatRecordPageCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790710942137-add-chat-record-page-command-menu-items.command';

it('discovers sender expansion through the application upgrade runner', () => {
  const registry = getAppProviderByClassName<UpgradeCommandRegistryService>(
    'UpgradeCommandRegistryService',
  );
  const command =
    getAppProviderByClassName<LinkChatMessageSendersToWorkspaceMembersCommand>(
      'LinkChatMessageSendersToWorkspaceMembersCommand',
    );
  expect(registry.getBundleForVersion('2.44.0').workspaceCommands).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ command, timestamp: 1790605326331 }),
    ]),
  );
});

// The move locks archivedAt again, so it has to run after the command that
// opened it
it('runs the chat record model commands after archivedAt was opened', () => {
  const registry = getAppProviderByClassName<UpgradeCommandRegistryService>(
    'UpgradeCommandRegistryService',
  );
  const commands = [
    getAppProviderByClassName<OpenAgentChatThreadArchivedAtWritabilityCommand>(
      'OpenAgentChatThreadArchivedAtWritabilityCommand',
    ),
    getAppProviderByClassName<MoveAgentChatThreadsToRecordModelCommand>(
      'MoveAgentChatThreadsToRecordModelCommand',
    ),
    getAppProviderByClassName<AddChatRecordPageCommandMenuItemsCommand>(
      'AddChatRecordPageCommandMenuItemsCommand',
    ),
  ];
  const { workspaceCommands } = registry.getBundleForVersion('2.44.0');
  const positions = commands.map((command) =>
    workspaceCommands.findIndex(
      (registeredCommand) => registeredCommand.command === command,
    ),
  );

  expect(positions).not.toContain(-1);
  expect([...positions].sort((left, right) => left - right)).toEqual(positions);
});
