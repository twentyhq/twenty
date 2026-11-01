import { randomUUID } from 'node:crypto';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  dropLegacyChatMembershipColumns,
  restoreLegacyChatMembershipColumns,
} from 'test/integration/utils/restore-legacy-chat-membership-columns.util';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const LEGACY_COLUMNS = [
  ['agentChatThread', 'userWorkspaceId'],
  ['agentChatThread', 'lastStreamError'],
  ['agentMessage', 'senderUserWorkspaceId'],
  ['agentMessage', 'isHidden'],
] as const;

describe('2-47 workspace command - drop legacy chat columns (integration)', () => {
  const threadId = randomUUID();
  const messageId = randomUUID();

  const readLegacyColumns = async () =>
    (
      await global.testDataSource.query<
        { tableName: string; columnName: string }[]
      >(
        `SELECT table_name AS "tableName", column_name AS "columnName"
         FROM information_schema.columns
         WHERE table_schema = $1 AND table_name IN ('agentChatThread', 'agentMessage')`,
        [SCHEMA],
      )
    )
      .filter(({ tableName, columnName }) =>
        LEGACY_COLUMNS.some(
          ([legacyTable, legacyColumn]) =>
            legacyTable === tableName && legacyColumn === columnName,
        ),
      )
      .map(({ tableName, columnName }) => `${tableName}.${columnName}`)
      .sort();

  const readLegacyFieldNames = async () => {
    const { flatFieldMetadataMaps } =
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, ['flatFieldMetadataMaps']);

    return Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((field) =>
        LEGACY_COLUMNS.some(
          ([legacyTable, legacyColumn]) =>
            STANDARD_OBJECTS[legacyTable].universalIdentifier ===
              field.objectMetadataUniversalIdentifier &&
            legacyColumn === field.name,
        ),
      )
      .map((field) => field.name)
      .sort();
  };

  beforeAll(async () => {
    // A workspace still on 2.46, with a chat older pods wrote by membership only
    await restoreLegacyChatMembershipColumns(SEED_APPLE_WORKSPACE_ID);
    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentChatThread" (id, title, "userWorkspaceId")
       VALUES ($1, 'Written by an older pod', $2)`,
      [threadId, USER_WORKSPACE_DATA_SEED_IDS.JANE],
    );
    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentMessage" (id, "threadId", role, status, "senderUserWorkspaceId")
       VALUES ($1, $2, 'user', 'sent', $3)`,
      [messageId, threadId, USER_WORKSPACE_DATA_SEED_IDS.JONY],
    );
  });

  afterAll(async () => {
    await dropLegacyChatMembershipColumns(SEED_APPLE_WORKSPACE_ID);
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."agentMessage" WHERE "threadId" = $1`,
      [threadId],
    );
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."agentChatThread" WHERE id = $1`,
      [threadId],
    );
  });

  it('starts from a workspace that still has the legacy columns', async () => {
    expect(await readLegacyColumns()).toHaveLength(LEGACY_COLUMNS.length);
    expect(await readLegacyFieldNames()).toHaveLength(LEGACY_COLUMNS.length);
  });

  it('links owners and senders to their members before dropping the columns', async () => {
    await dropLegacyChatMembershipColumns(SEED_APPLE_WORKSPACE_ID);

    expect(
      await global.testDataSource.query(
        `SELECT "workspaceMemberId" FROM ${SCHEMA}."agentChatThread" WHERE id = $1`,
        [threadId],
      ),
    ).toEqual([{ workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE }]);
    expect(
      await global.testDataSource.query(
        `SELECT "senderWorkspaceMemberId" FROM ${SCHEMA}."agentMessage" WHERE id = $1`,
        [messageId],
      ),
    ).toEqual([
      { senderWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY },
    ]);
    expect(await readLegacyColumns()).toEqual([]);
    expect(await readLegacyFieldNames()).toEqual([]);
  });

  it('changes nothing when run again', async () => {
    await expect(
      dropLegacyChatMembershipColumns(SEED_APPLE_WORKSPACE_ID),
    ).resolves.toBeUndefined();
    expect(await readLegacyColumns()).toEqual([]);
  });
});
