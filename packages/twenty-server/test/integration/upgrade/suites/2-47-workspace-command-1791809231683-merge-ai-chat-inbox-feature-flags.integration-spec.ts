import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type MergeAiChatInboxFeatureFlagsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791809231683-merge-ai-chat-inbox-feature-flags.command';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const setFlag = (key: string, value: boolean) =>
  global.testDataSource.query(
    `INSERT INTO core."featureFlag" ("workspaceId", key, value)
     VALUES ($1, $2, $3)
     ON CONFLICT ("key", "workspaceId") DO UPDATE SET value = $3`,
    [SEED_APPLE_WORKSPACE_ID, key, value],
  );

const readFlags = async (): Promise<Record<string, boolean>> => {
  const rows: { key: string; value: boolean }[] =
    await global.testDataSource.query(
      `SELECT key, value FROM core."featureFlag"
       WHERE "workspaceId" = $1 AND key = ANY($2::text[])`,
      [
        SEED_APPLE_WORKSPACE_ID,
        [
          'IS_AI_CHAT_INBOX_ENABLED',
          'IS_CONVERSATIONS_TAB_ENABLED',
          'IS_WORKFLOW_SEND_CHAT_MESSAGE_ENABLED',
        ],
      ],
    );

  return Object.fromEntries(rows.map(({ key, value }) => [key, value]));
};

describe('2-47 workspace command - merge AI chat inbox feature flags (integration)', () => {
  let command: MergeAiChatInboxFeatureFlagsCommand;

  beforeAll(() => {
    command = getAppProviderByClassName<MergeAiChatInboxFeatureFlagsCommand>(
      'MergeAiChatInboxFeatureFlagsCommand',
    );
  });

  afterAll(async () => {
    await setFlag('IS_AI_CHAT_INBOX_ENABLED', true);
  });

  it('turns the inbox on for a workspace that had one of the merged flags, and drops them', async () => {
    await setFlag('IS_AI_CHAT_INBOX_ENABLED', false);
    await setFlag('IS_CONVERSATIONS_TAB_ENABLED', true);
    await setFlag('IS_WORKFLOW_SEND_CHAT_MESSAGE_ENABLED', false);

    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await readFlags()).toEqual({ IS_AI_CHAT_INBOX_ENABLED: true });
  });

  it('leaves the inbox off when none of the merged flags was on', async () => {
    await setFlag('IS_AI_CHAT_INBOX_ENABLED', false);
    await setFlag('IS_CONVERSATIONS_TAB_ENABLED', false);

    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await readFlags()).toEqual({ IS_AI_CHAT_INBOX_ENABLED: false });
  });

  it('brings the merged flags back with the inbox value on down', async () => {
    await setFlag('IS_AI_CHAT_INBOX_ENABLED', true);

    await command.down(RUN_ON_WORKSPACE_ARGS);

    expect(await readFlags()).toEqual({
      IS_AI_CHAT_INBOX_ENABLED: true,
      IS_CONVERSATIONS_TAB_ENABLED: true,
      IS_WORKFLOW_SEND_CHAT_MESSAGE_ENABLED: true,
    });

    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await readFlags()).toEqual({ IS_AI_CHAT_INBOX_ENABLED: true });
  });
});
