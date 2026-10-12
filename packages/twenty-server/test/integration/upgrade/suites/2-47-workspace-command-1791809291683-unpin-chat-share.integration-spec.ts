import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type UnpinChatShareCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791809291683-unpin-chat-share.command';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const CHAT_SHARE_UNIVERSAL_IDENTIFIER = 'b9336f9f-d10c-42c0-b7cd-40c94ae235ef';

const readChatShare = async () => {
  const [chatShare]: {
    isPinned: boolean;
    conditionalAvailabilityExpression: string | null;
  }[] = await global.testDataSource.query(
    `SELECT "isPinned", "conditionalAvailabilityExpression"
     FROM core."commandMenuItem"
     WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
    [SEED_APPLE_WORKSPACE_ID, CHAT_SHARE_UNIVERSAL_IDENTIFIER],
  );

  return chatShare;
};

describe('2-47 workspace command - unpin chat share (integration)', () => {
  let command: UnpinChatShareCommand;

  beforeAll(() => {
    command = getAppProviderByClassName<UnpinChatShareCommand>(
      'UnpinChatShareCommand',
    );
  });

  // The dev seed already holds the new item; down then up proves both
  // directions
  afterAll(async () => {
    await command.up(RUN_ON_WORKSPACE_ARGS);
  });

  it('pins the chat Share item behind its flags on down, and moves it back on up', async () => {
    await command.down(RUN_ON_WORKSPACE_ARGS);

    expect(await readChatShare()).toEqual({
      isPinned: true,
      conditionalAvailabilityExpression:
        'numberOfSelectedRecords == 1 and (featureFlags.IS_AI_CHAT_SHARING_DROPDOWN_ENABLED or featureFlags.IS_RECORD_LEVEL_SHARING_ENABLED) and noneDefined(selectedRecords, "deletedAt")',
    });

    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await readChatShare()).toEqual({
      isPinned: false,
      conditionalAvailabilityExpression:
        'numberOfSelectedRecords == 1 and noneDefined(selectedRecords, "deletedAt")',
    });
  });
});
