import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type SeedDefaultAgentChatChannelsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791387425039-seed-default-agent-chat-channels.command';
import { buildAgentChatDefaultChannelId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-default-channel-id.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const GENERAL_CHANNEL_ID = buildAgentChatDefaultChannelId({
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  kind: 'GENERAL',
});

const SYSTEM_CHANNEL_ID = buildAgentChatDefaultChannelId({
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  kind: 'SYSTEM',
});

const { JANE, JONY } = WORKSPACE_MEMBER_DATA_SEED_IDS;

const readDefaultChannels = async () => {
  const channels: { id: string; name: string; visibility: string }[] =
    await global.testDataSource.query(
      `SELECT id, name, visibility FROM ${SCHEMA}."agentChatChannel"
       WHERE id = ANY($1::uuid[]) ORDER BY name`,
      [[GENERAL_CHANNEL_ID, SYSTEM_CHANNEL_ID]],
    );
  const members: { channelId: string; workspaceMemberId: string }[] =
    await global.testDataSource.query(
      `SELECT "channelId", "workspaceMemberId" FROM ${SCHEMA}."agentChatChannelMember"
       WHERE "channelId" = ANY($1::uuid[])`,
      [[GENERAL_CHANNEL_ID, SYSTEM_CHANNEL_ID]],
    );
  const generalAccess: unknown[] = await global.testDataSource.query(
    `SELECT 1 FROM ${SCHEMA}."recordShare"
     WHERE "recordId" = $1 AND "principalType" = 'EVERYONE'`,
    [GENERAL_CHANNEL_ID],
  );

  const memberIdsOf = (channelId: string) =>
    members
      .filter((member) => member.channelId === channelId)
      .map(({ workspaceMemberId }) => workspaceMemberId);

  return {
    channels,
    generalMemberIds: memberIdsOf(GENERAL_CHANNEL_ID),
    systemMemberIds: memberIdsOf(SYSTEM_CHANNEL_ID),
    hasGeneralAccess: generalAccess.length === 1,
  };
};

describe('2-46 workspace command - seed default agent chat channels (integration)', () => {
  let command: SeedDefaultAgentChatChannelsCommand;

  beforeAll(() => {
    command = getAppProviderByClassName<SeedDefaultAgentChatChannelsCommand>(
      'SeedDefaultAgentChatChannelsCommand',
    );
  });

  // The dev seed already created them; down then up proves both directions
  afterAll(async () => {
    await command.up(RUN_ON_WORKSPACE_ARGS);
  });

  it('removes the default channels on down', async () => {
    await command.down(RUN_ON_WORKSPACE_ARGS);

    expect(await readDefaultChannels()).toEqual({
      channels: [],
      generalMemberIds: [],
      systemMemberIds: [],
      hasGeneralAccess: false,
    });
  });

  it('creates General for every member with AI access and System for those who manage the workspace', async () => {
    await command.down(RUN_ON_WORKSPACE_ARGS);
    await command.up(RUN_ON_WORKSPACE_ARGS);

    const { channels, generalMemberIds, systemMemberIds, hasGeneralAccess } =
      await readDefaultChannels();

    expect(channels).toEqual([
      { id: GENERAL_CHANNEL_ID, name: 'General', visibility: 'PUBLIC' },
      { id: SYSTEM_CHANNEL_ID, name: 'System', visibility: 'PRIVATE' },
    ]);
    expect(generalMemberIds).toEqual(expect.arrayContaining([JANE, JONY]));
    expect(systemMemberIds).toContain(JANE);
    expect(systemMemberIds).not.toContain(JONY);
    expect(hasGeneralAccess).toBe(true);
  });

  it('leaves existing default channels as their members made them', async () => {
    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."agentChatChannel" SET name = 'Everyone' WHERE id = $1`,
      [GENERAL_CHANNEL_ID],
    );

    await command.up(RUN_ON_WORKSPACE_ARGS);

    const { channels } = await readDefaultChannels();

    expect(channels.map(({ name }) => name)).toEqual(['Everyone', 'System']);

    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."agentChatChannel" SET name = 'General' WHERE id = $1`,
      [GENERAL_CHANNEL_ID],
    );
  });
});
