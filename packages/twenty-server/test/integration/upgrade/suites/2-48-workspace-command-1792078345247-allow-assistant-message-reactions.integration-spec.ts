import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AllowAssistantMessageReactionsCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1792078345247-allow-assistant-message-reactions.command';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const readWorkspaceMemberNullability = async () => {
  const [column]: { isNullable: string }[] = await global.testDataSource.query(
    `SELECT is_nullable AS "isNullable" FROM information_schema.columns
     WHERE table_schema = $1 AND table_name = 'agentMessageReaction'
       AND column_name = 'workspaceMemberId'`,
    [getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)],
  );
  const [field]: { isNullable: boolean }[] = await global.testDataSource.query(
    `SELECT "isNullable" FROM core."fieldMetadata"
     WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
    [
      SEED_APPLE_WORKSPACE_ID,
      STANDARD_OBJECTS.agentMessageReaction.fields.workspaceMember
        .universalIdentifier,
    ],
  );

  return {
    isColumnNullable: column.isNullable === 'YES',
    isFieldNullable: field.isNullable,
  };
};

describe('2-48 workspace command - allow assistant message reactions (integration)', () => {
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

  it('makes the reaction member optional again after a rollback, and is idempotent', async () => {
    await command.down(runOnWorkspaceArgs);

    expect(await readWorkspaceMemberNullability()).toEqual({
      isColumnNullable: false,
      isFieldNullable: false,
    });

    await command.up(runOnWorkspaceArgs);
    await command.up(runOnWorkspaceArgs);

    expect(await readWorkspaceMemberNullability()).toEqual({
      isColumnNullable: true,
      isFieldNullable: true,
    });
  });
});
