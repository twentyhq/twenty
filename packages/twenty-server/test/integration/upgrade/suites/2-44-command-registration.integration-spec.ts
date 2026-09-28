import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { type LinkChatMessageSendersToWorkspaceMembersCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790605326331-link-chat-message-senders-to-workspace-members.command';

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
