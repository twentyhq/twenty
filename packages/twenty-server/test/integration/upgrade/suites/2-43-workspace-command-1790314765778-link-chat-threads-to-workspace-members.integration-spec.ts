import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { randomUUID } from 'node:crypto';

import { type LinkChatThreadsToWorkspaceMembersCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790314765778-link-chat-threads-to-workspace-members.command';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const THREAD_TABLE = `"${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"."agentChatThread"`;

describe('2-43 workspace command 1790314765778 - LinkChatThreadsToWorkspaceMembersCommand (integration)', () => {
  const janeThreadId = randomUUID();
  const departedThreadId = randomUUID();
  const departedUserWorkspaceId = randomUUID();
  let command: LinkChatThreadsToWorkspaceMembersCommand;

  const readThreads = async () =>
    (await global.testDataSource.query(
      `SELECT id, "workspaceMemberId", "userWorkspaceId" FROM ${THREAD_TABLE} WHERE id = ANY($1) ORDER BY id`,
      [[janeThreadId, departedThreadId]],
    )) as {
      id: string;
      workspaceMemberId: string | null;
      userWorkspaceId: string;
    }[];

  beforeAll(async () => {
    command =
      getAppProviderByClassName<LinkChatThreadsToWorkspaceMembersCommand>(
        'LinkChatThreadsToWorkspaceMembersCommand',
      );

    // Recreate the 2.42 shape: owners only known by membership.
    await global.testDataSource.query(
      `INSERT INTO ${THREAD_TABLE} (id, "userWorkspaceId") VALUES ($1, $2), ($3, $4)`,
      [
        janeThreadId,
        USER_WORKSPACE_DATA_SEED_IDS.JANE,
        departedThreadId,
        departedUserWorkspaceId,
      ],
    );
  });

  afterAll(async () => {
    await global.testDataSource.query(
      `DELETE FROM ${THREAD_TABLE} WHERE id = ANY($1)`,
      [[janeThreadId, departedThreadId]],
    );
  });

  it('links threads to members and keeps the legacy owner', async () => {
    await command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
    });

    expect(await readThreads()).toEqual(
      [
        {
          id: janeThreadId,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
        },
        {
          id: departedThreadId,
          workspaceMemberId: null,
          userWorkspaceId: departedUserWorkspaceId,
        },
      ].sort((left, right) => left.id.localeCompare(right.id)),
    );
  });

  it('is a no-op on a rerun', async () => {
    const before = await readThreads();

    await command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
    });

    expect(await readThreads()).toEqual(before);
  });
});
