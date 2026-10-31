import { randomUUID } from 'node:crypto';

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type MakeChatThreadsPrivateRecordsCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793460623155-make-chat-threads-private-records.command';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

describe('2-55 workspace command - make chat threads private records (integration)', () => {
  let command: MakeChatThreadsPrivateRecordsCommand;
  let threadObjectMetadataId: string;
  let privateThreadId: string;
  let sharedThreadId: string;

  const runOnWorkspace = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

  const findPrivateThreadIds = async (): Promise<string[]> =>
    (
      await global.testDataSource.query(
        `SELECT id FROM "${SCHEMA}"."agentChatThread" WHERE "_isPrivate" AND id = ANY($1)`,
        [[privateThreadId, sharedThreadId]],
      )
    ).map(({ id }: { id: string }) => id);

  const countEveryoneShares = async (): Promise<number> => {
    const [{ count }] = await global.testDataSource.query(
      `SELECT COUNT(*) AS count FROM "${SCHEMA}"."recordShare"
         WHERE "objectMetadataId" = $1 AND "principalType" = 'EVERYONE' AND "recordId" = ANY($2)`,
      [threadObjectMetadataId, [privateThreadId, sharedThreadId]],
    );

    return Number(count);
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<MakeChatThreadsPrivateRecordsCommand>(
      'MakeChatThreadsPrivateRecordsCommand',
    );

    [{ id: threadObjectMetadataId }] = await global.testDataSource.query(
      `SELECT id FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = 'agentChatThread'`,
      [SEED_APPLE_WORKSPACE_ID],
    );
    privateThreadId = randomUUID();
    sharedThreadId = randomUUID();
    await global.testDataSource.query(
      `INSERT INTO "${SCHEMA}"."agentChatThread" (id) VALUES ($1), ($2)`,
      [privateThreadId, sharedThreadId],
    );
    await global.testDataSource.query(
      `INSERT INTO "${SCHEMA}"."recordShare"
         ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
       VALUES ($1, $2, $4, 'EVERYONE', 'NONE', 'MANUAL', $2), ($1, $3, $4, 'EVERYONE', 'READ_WRITE', 'MANUAL', $3)`,
      [
        threadObjectMetadataId,
        privateThreadId,
        sharedThreadId,
        EVERYONE_PRINCIPAL_ID,
      ],
    );
  });

  afterAll(async () => {
    await global.testDataSource.query(
      `DELETE FROM "${SCHEMA}"."recordShare" WHERE "recordId" = ANY($1)`,
      [[privateThreadId, sharedThreadId]],
    );
    await global.testDataSource.query(
      `DELETE FROM "${SCHEMA}"."agentChatThread" WHERE id = ANY($1)`,
      [[privateThreadId, sharedThreadId]],
    );
  });

  it('changes nothing on a dry run', async () => {
    await runOnWorkspace({ dryRun: true });

    expect(await findPrivateThreadIds()).toEqual([]);
    expect(await countEveryoneShares()).toBe(2);
  });

  it('makes every chat thread private and leaves its share rows', async () => {
    await runOnWorkspace();

    expect((await findPrivateThreadIds()).sort()).toEqual(
      [privateThreadId, sharedThreadId].sort(),
    );
    expect(await countEveryoneShares()).toBe(2);
  });
});
