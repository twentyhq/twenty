import { randomUUID } from 'node:crypto';

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type MakeChatThreadsPrivateRecordsCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793460623155-make-chat-threads-private-records.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

describe('2-55 workspace command - make chat threads private records (integration)', () => {
  let command: MakeChatThreadsPrivateRecordsCommand;
  let workspaceCacheService: WorkspaceCacheService;
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

  const setChatThreadFlag = async (value: boolean) => {
    await global.testDataSource.query(
      `INSERT INTO core."featureFlag" ("workspaceId", key, value) VALUES ($1, $2, $3)
         ON CONFLICT ("workspaceId", key) DO UPDATE SET value = $3`,
      [
        SEED_APPLE_WORKSPACE_ID,
        FeatureFlagKey.IS_PRIVATE_CHAT_THREAD_ENABLED,
        value,
      ],
    );
    await workspaceCacheService.invalidateAndRecompute(
      SEED_APPLE_WORKSPACE_ID,
      ['featureFlagsMap'],
    );
  };

  const findPrivateThreadIds = async (): Promise<string[]> =>
    (
      await global.testDataSource.query(
        `SELECT id FROM "${SCHEMA}"."agentChatThread" WHERE "_isPrivate" AND id = ANY($1)`,
        [[privateThreadId, sharedThreadId]],
      )
    ).map(({ id }: { id: string }) => id);

  const findColumnDefault = async (): Promise<string | null> => {
    const [{ columnDefault }] = await global.testDataSource.query(
      `SELECT column_default AS "columnDefault" FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = 'agentChatThread' AND column_name = '_isPrivate'`,
      [SCHEMA],
    );

    return columnDefault;
  };

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
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );

    [{ id: threadObjectMetadataId }] = await global.testDataSource.query(
      `SELECT id FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = 'agentChatThread'`,
      [SEED_APPLE_WORKSPACE_ID],
    );
    privateThreadId = randomUUID();
    sharedThreadId = randomUUID();
    await global.testDataSource.query(
      `ALTER TABLE "${SCHEMA}"."agentChatThread" ALTER COLUMN "_isPrivate" SET DEFAULT false`,
    );
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
    await setChatThreadFlag(false);
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
    await global.testDataSource.query(
      `ALTER TABLE "${SCHEMA}"."agentChatThread" ALTER COLUMN "_isPrivate" SET DEFAULT true`,
    );
    await setChatThreadFlag(true);
  });

  it('changes nothing on a dry run', async () => {
    await runOnWorkspace({ dryRun: true });

    expect(await findPrivateThreadIds()).toEqual([]);
    expect(await countEveryoneShares()).toBe(2);
    expect(await findColumnDefault()).toBe('false');
  });

  it('makes chat threads private unless shared with everyone and creates new ones private', async () => {
    await runOnWorkspace();

    expect(await findPrivateThreadIds()).toEqual([privateThreadId]);
    expect(await countEveryoneShares()).toBe(0);
    expect(await findColumnDefault()).toBe('true');
  });

  it('leaves a converted workspace alone', async () => {
    await global.testDataSource.query(
      `UPDATE "${SCHEMA}"."agentChatThread" SET "_isPrivate" = false WHERE id = $1`,
      [privateThreadId],
    );

    await runOnWorkspace();

    expect(await findPrivateThreadIds()).toEqual([]);
  });
});
