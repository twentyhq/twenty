import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type UnpinChatShareCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791823097314-unpin-chat-share.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const CHAT_SHARE_UNIVERSAL_IDENTIFIER = 'b9336f9f-d10c-42c0-b7cd-40c94ae235ef';

const UNPINNED_CHAT_SHARE = {
  isPinned: false,
  conditionalAvailabilityExpression:
    'numberOfSelectedRecords == 1 and noneDefined(selectedRecords, "deletedAt")',
};

const readChatShareIsPinned = async () => {
  const [chatShare]: { isPinned: boolean }[] =
    await global.testDataSource.query(
      `SELECT "isPinned"
     FROM core."commandMenuItem"
     WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
      [SEED_APPLE_WORKSPACE_ID, CHAT_SHARE_UNIVERSAL_IDENTIFIER],
    );

  return chatShare.isPinned;
};

describe('2-47 workspace command - unpin chat share (integration)', () => {
  let command: UnpinChatShareCommand;
  let workspaceCacheService: WorkspaceCacheService;

  const setChatShare = async ({
    isPinned,
    conditionalAvailabilityExpression,
  }: typeof UNPINNED_CHAT_SHARE) => {
    await global.testDataSource.query(
      `UPDATE core."commandMenuItem"
       SET "isPinned" = $3, "conditionalAvailabilityExpression" = $4
       WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
      [
        SEED_APPLE_WORKSPACE_ID,
        CHAT_SHARE_UNIVERSAL_IDENTIFIER,
        isPinned,
        conditionalAvailabilityExpression,
      ],
    );
    await workspaceCacheService.invalidateAndRecompute(
      SEED_APPLE_WORKSPACE_ID,
      ['flatCommandMenuItemMaps'],
    );
  };

  beforeAll(() => {
    command = getAppProviderByClassName<UnpinChatShareCommand>(
      'UnpinChatShareCommand',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
  });

  afterAll(async () => {
    await setChatShare(UNPINNED_CHAT_SHARE);
  });

  it('pins the chat Share item on down, and unpins it on up', async () => {
    await command.down(RUN_ON_WORKSPACE_ARGS);

    expect(await readChatShareIsPinned()).toBe(true);

    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await readChatShareIsPinned()).toBe(false);
  });

  it.each([
    { ...UNPINNED_CHAT_SHARE, isPinned: true },
    { ...UNPINNED_CHAT_SHARE, conditionalAvailabilityExpression: 'false' },
  ])(
    'keeps a chat Share item the workspace changed (%o)',
    async (customizedChatShare) => {
      await setChatShare(customizedChatShare);

      await command.down(RUN_ON_WORKSPACE_ARGS);
      expect(await readChatShareIsPinned()).toBe(customizedChatShare.isPinned);

      await command.up(RUN_ON_WORKSPACE_ARGS);
      expect(await readChatShareIsPinned()).toBe(customizedChatShare.isPinned);
    },
  );
});
