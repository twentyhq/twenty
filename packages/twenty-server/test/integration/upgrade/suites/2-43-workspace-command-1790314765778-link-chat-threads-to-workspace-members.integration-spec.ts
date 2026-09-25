import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { randomUUID } from 'node:crypto';

import { type LinkChatThreadsToWorkspaceMembersCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790314765778-link-chat-threads-to-workspace-members.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const LEGACY_FIELD_IDENTIFIER = 'bf830886-b6dc-46e9-a229-eecbb0e66032';
const THREAD_TABLE = `"${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"."agentChatThread"`;

describe('2-43 workspace command 1790314765778 - LinkChatThreadsToWorkspaceMembersCommand (integration)', () => {
  const janeThreadId = randomUUID();
  const departedThreadId = randomUUID();
  const departedUserWorkspaceId = randomUUID();
  let command: LinkChatThreadsToWorkspaceMembersCommand;

  const invalidateMetadata = () =>
    getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
    ]);

  const readThreads = async () =>
    (await global.testDataSource.query(
      `SELECT id, "workspaceMemberId", "userWorkspaceId" FROM ${THREAD_TABLE} WHERE id = ANY($1) ORDER BY id`,
      [[janeThreadId, departedThreadId]],
    )) as {
      id: string;
      workspaceMemberId: string | null;
      userWorkspaceId: string;
    }[];

  const readLegacyColumnNullability = async () => {
    const [field] = await global.testDataSource.query(
      `SELECT "isNullable" FROM core."fieldMetadata" WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
      [SEED_APPLE_WORKSPACE_ID, LEGACY_FIELD_IDENTIFIER],
    );
    const [column] = await global.testDataSource.query(
      `SELECT is_nullable FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'agentChatThread' AND column_name = 'userWorkspaceId'`,
      [getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)],
    );

    return { metadata: field.isNullable, column: column.is_nullable };
  };

  beforeAll(async () => {
    command =
      getAppProviderByClassName<LinkChatThreadsToWorkspaceMembersCommand>(
        'LinkChatThreadsToWorkspaceMembersCommand',
      );

    // Recreate the 2.42 shape: owners only known by membership, and a
    // required legacy column.
    await global.testDataSource.query(
      `INSERT INTO ${THREAD_TABLE} (id, "userWorkspaceId") VALUES ($1, $2), ($3, $4)`,
      [
        janeThreadId,
        USER_WORKSPACE_DATA_SEED_IDS.JANE,
        departedThreadId,
        departedUserWorkspaceId,
      ],
    );
    await global.testDataSource.query(
      `UPDATE core."fieldMetadata" SET "isNullable" = false WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
      [SEED_APPLE_WORKSPACE_ID, LEGACY_FIELD_IDENTIFIER],
    );
    await global.testDataSource.query(
      `ALTER TABLE ${THREAD_TABLE} ALTER COLUMN "userWorkspaceId" SET NOT NULL`,
    );
    await invalidateMetadata();
  });

  afterAll(async () => {
    await global.testDataSource.query(
      `DELETE FROM ${THREAD_TABLE} WHERE id = ANY($1)`,
      [[janeThreadId, departedThreadId]],
    );
  });

  it('links threads to members and leaves the legacy owner optional', async () => {
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
    expect(await readLegacyColumnNullability()).toEqual({
      metadata: true,
      column: 'YES',
    });
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
