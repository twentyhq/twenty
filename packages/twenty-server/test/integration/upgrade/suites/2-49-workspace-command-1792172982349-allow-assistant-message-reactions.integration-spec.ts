import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AllowAssistantMessageReactionsCommand } from 'src/database/commands/upgrade-version-command/2-49/2-49-workspace-command-1792172982349-allow-assistant-message-reactions.command';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const readReactionColumns = async () => {
  const columns: { name: string; isNullable: string }[] =
    await global.testDataSource.query(
      `SELECT column_name AS name, is_nullable AS "isNullable"
       FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = 'agentMessageReaction'
         AND column_name IN ('workspaceMemberId', 'agentId')`,
      [getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)],
    );
  const fields: { universalIdentifier: string; isNullable: boolean }[] =
    await global.testDataSource.query(
      `SELECT "universalIdentifier", "isNullable" FROM core."fieldMetadata"
       WHERE "workspaceId" = $1 AND "universalIdentifier" = ANY($2)`,
      [
        SEED_APPLE_WORKSPACE_ID,
        [
          STANDARD_OBJECTS.agentMessageReaction.fields.workspaceMember
            .universalIdentifier,
          STANDARD_OBJECTS.agentMessageReaction.fields.agentId
            .universalIdentifier,
        ],
      ],
    );
  const workspaceMemberColumn = columns.find(
    ({ name }) => name === 'workspaceMemberId',
  );
  const workspaceMemberField = fields.find(
    ({ universalIdentifier }) =>
      universalIdentifier ===
      STANDARD_OBJECTS.agentMessageReaction.fields.workspaceMember
        .universalIdentifier,
  );

  return {
    isWorkspaceMemberColumnNullable:
      workspaceMemberColumn?.isNullable === 'YES',
    isWorkspaceMemberFieldNullable: workspaceMemberField?.isNullable,
    hasAgentIdColumn: columns.some(({ name }) => name === 'agentId'),
    hasAgentIdField: fields.some(
      ({ universalIdentifier }) =>
        universalIdentifier ===
        STANDARD_OBJECTS.agentMessageReaction.fields.agentId
          .universalIdentifier,
    ),
  };
};

describe('2-49 workspace command - allow assistant message reactions (integration)', () => {
  const runOnWorkspaceArgs = {
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    options: {},
    index: 0,
    total: 1,
    dataSource: global.testDataSource,
  };
  let command: AllowAssistantMessageReactionsCommand;

  beforeAll(() => {
    command = getAppProviderByClassName<AllowAssistantMessageReactionsCommand>(
      'AllowAssistantMessageReactionsCommand',
    );
  });

  afterAll(async () => {
    await command.up(runOnWorkspaceArgs);
  });

  it('makes the reaction member optional and adds the agent again after a rollback, and is idempotent', async () => {
    await command.down(runOnWorkspaceArgs);

    expect(await readReactionColumns()).toEqual({
      isWorkspaceMemberColumnNullable: false,
      isWorkspaceMemberFieldNullable: false,
      hasAgentIdColumn: false,
      hasAgentIdField: false,
    });

    await command.up(runOnWorkspaceArgs);
    await command.up(runOnWorkspaceArgs);

    expect(await readReactionColumns()).toEqual({
      isWorkspaceMemberColumnNullable: true,
      isWorkspaceMemberFieldNullable: true,
      hasAgentIdColumn: true,
      hasAgentIdField: true,
    });
  });
});
