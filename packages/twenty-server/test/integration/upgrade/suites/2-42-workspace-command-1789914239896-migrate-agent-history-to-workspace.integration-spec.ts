import { randomUUID } from 'node:crypto';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { type DataSource } from 'typeorm';

import { AGENT_HISTORY_TABLES } from 'src/database/commands/agent-history/agent-history-tables.constant';
import { type MigrateAgentHistoryToWorkspaceCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789914239896-migrate-agent-history-to-workspace.command';
import { type ProvisionAgentChatThreadTargetCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790268647460-provision-agent-chat-thread-target.command';
import { type UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { type WorkspaceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/workspace-command-runner.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type AgentChatStreamHeartbeatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-heartbeat.service';
import { AGENT_HISTORY_STORAGE_KEY } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-history-storage-key.constant';
import { type AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;
const SCHEMA = getWorkspaceSchemaName(WORKSPACE_ID);

// The link object 2.43 adds on top of agent history, as later suites see it:
// its fields and the relations pointing at it, its indexes and its foreign keys.
const describeAgentChatThreadTarget = async (dataSource: DataSource) => ({
  fields: await dataSource.query<{ objectName: string; fieldName: string }[]>(
    `SELECT objectMetadata."nameSingular" AS "objectName", fieldMetadata.name AS "fieldName"
     FROM core."fieldMetadata" fieldMetadata
     JOIN core."objectMetadata" objectMetadata ON objectMetadata.id = fieldMetadata."objectMetadataId"
     JOIN core."objectMetadata" linkObjectMetadata
       ON linkObjectMetadata.id IN (fieldMetadata."objectMetadataId", fieldMetadata."relationTargetObjectMetadataId")
     WHERE linkObjectMetadata."workspaceId" = $1 AND linkObjectMetadata."nameSingular" = 'agentChatThreadTarget'
     ORDER BY 1, 2`,
    [WORKSPACE_ID],
  ),
  indexes: await dataSource.query<{ name: string; fieldCount: number }[]>(
    `SELECT indexMetadata.name, COUNT(indexFieldMetadata.id)::int AS "fieldCount"
     FROM core."indexMetadata" indexMetadata
     JOIN core."objectMetadata" linkObjectMetadata ON linkObjectMetadata.id = indexMetadata."objectMetadataId"
     LEFT JOIN core."indexFieldMetadata" indexFieldMetadata ON indexFieldMetadata."indexMetadataId" = indexMetadata.id
     WHERE linkObjectMetadata."workspaceId" = $1 AND linkObjectMetadata."nameSingular" = 'agentChatThreadTarget'
     GROUP BY indexMetadata.name
     ORDER BY indexMetadata.name`,
    [WORKSPACE_ID],
  ),
  foreignKeyColumns: await dataSource.query<{ columnName: string }[]>(
    `SELECT keyColumn.column_name AS "columnName"
     FROM information_schema.table_constraints tableConstraint
     JOIN information_schema.key_column_usage keyColumn
       ON keyColumn.constraint_schema = tableConstraint.constraint_schema
      AND keyColumn.constraint_name = tableConstraint.constraint_name
     WHERE tableConstraint.table_schema = $1
       AND tableConstraint.table_name = 'agentChatThreadTarget'
       AND tableConstraint.constraint_type = 'FOREIGN KEY'
     ORDER BY 1`,
    [SCHEMA],
  ),
});

jest.setTimeout(60_000);

describe('versioned agent history upgrade (integration)', () => {
  let command: MigrateAgentHistoryToWorkspaceCommand;
  let dataSource: DataSource;
  let workspaceOrmManager: WorkspaceOrmManager;
  let storage: AgentHistoryStorageService;
  let heartbeat: AgentChatStreamHeartbeatService;
  let upgradeRunner: WorkspaceCommandRunnerService;
  let upgradeCommandName: string;
  let provisionAgentChatThreadTargetCommand: ProvisionAgentChatThreadTargetCommand;
  let seededAgentChatThreadTarget: Awaited<
    ReturnType<typeof describeAgentChatThreadTarget>
  >;
  const threadId = randomUUID();
  const streamId = randomUUID();

  const runCommand = (direction: 'up' | 'down', dryRun = false) =>
    workspaceOrmManager.executeInWorkspaceContext(async () => {
      const context = {
        workspaceId: WORKSPACE_ID,
        dataSource,
        index: 0,
        total: 1,
      };
      if (direction === 'down') {
        await command.down({ ...context, options: { dryRun } });
      } else {
        await upgradeRunner.runWorkspaceCommands({
          iteratorContext: context,
          options: { dryRun },
          workspaceCommands: [{ name: upgradeCommandName, command }],
        });
      }
    }, buildSystemAuthContext(WORKSPACE_ID));

  beforeAll(async () => {
    command = getAppProviderByClassName<MigrateAgentHistoryToWorkspaceCommand>(
      'MigrateAgentHistoryToWorkspaceCommand',
    );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
    storage = getAppProviderByClassName<AgentHistoryStorageService>(
      'AgentHistoryStorageService',
    );
    heartbeat = getAppProviderByClassName<AgentChatStreamHeartbeatService>(
      'AgentChatStreamHeartbeatService',
    );
    upgradeRunner = getAppProviderByClassName<WorkspaceCommandRunnerService>(
      'WorkspaceCommandRunnerService',
    );
    provisionAgentChatThreadTargetCommand =
      getAppProviderByClassName<ProvisionAgentChatThreadTargetCommand>(
        'ProvisionAgentChatThreadTargetCommand',
      );
    const registry = getAppProviderByClassName<UpgradeCommandRegistryService>(
      'UpgradeCommandRegistryService',
    );
    const registeredCommand = registry
      .getBundleForVersion('2.42.0')
      .workspaceCommands.find((entry) => entry.command === command);
    expect(registeredCommand?.timestamp).toBe(1789914239896);
    upgradeCommandName = registeredCommand!.name;
    const owners = getCoreRepository<UserWorkspaceEntity>(UserWorkspaceEntity);
    dataSource = owners.manager.connection;
    const owner = await owners.findOneByOrFail({ workspaceId: WORKSPACE_ID });

    await runCommand('down');
    await dataSource.query(
      'INSERT INTO core."agentChatThread" (id, "workspaceId", "userWorkspaceId", title, "activeStreamId") VALUES ($1, $2, $3, $4, $5)',
      [threadId, WORKSPACE_ID, owner.id, 'History before upgrade', streamId],
    );

    seededAgentChatThreadTarget =
      await describeAgentChatThreadTarget(dataSource);

    // Recreate a pre-upgrade workspace: history exists only in core, and none
    // of the five standard objects has been installed yet, nor the link object
    // 2.43 adds on top of them. Leaving that one in place would strand it
    // without its thread relation, which the deleted thread object takes along.
    await dataSource.query(
      'DELETE FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = ANY($2)',
      [
        WORKSPACE_ID,
        [
          ...AGENT_HISTORY_TABLES.map(({ name }) => name),
          'agentChatThreadTarget',
        ],
      ],
    );
    await dataSource.query(`DROP TABLE "${SCHEMA}"."agentChatThreadTarget"`);
    for (const { name } of [...AGENT_HISTORY_TABLES].reverse()) {
      await dataSource.query(`DROP TABLE "${SCHEMA}"."${name}" CASCADE`);
    }
    // Pre-upgrade workspaces have no attachment side of the chat thread
    // relation either; the object deletion above only cascades its metadata.
    await dataSource.query(
      'DELETE FROM core."indexMetadata" WHERE "workspaceId" = $1 AND "universalIdentifier" = $2',
      [
        WORKSPACE_ID,
        STANDARD_OBJECTS.attachment.indexes.agentChatThreadIdIndex
          .universalIdentifier,
      ],
    );
    await dataSource.query(
      `ALTER TABLE "${SCHEMA}"."attachment" DROP COLUMN IF EXISTS "targetAgentChatThreadId"`,
    );
    await dataSource.query(
      'DELETE FROM core."keyValuePair" WHERE "workspaceId" = $1 AND key = $2',
      [WORKSPACE_ID, AGENT_HISTORY_STORAGE_KEY],
    );
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(WORKSPACE_ID, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
    ]);
  });

  afterAll(async () => {
    await heartbeat.clear(streamId);
    // Restore the seeded workspace so later integration suites can use it.
    await dataSource.query(
      'UPDATE core."agentChatThread" SET "activeStreamId" = NULL WHERE id = $1',
      [threadId],
    );
    await runCommand('up');
    await workspaceOrmManager.executeInWorkspaceContext(
      () =>
        provisionAgentChatThreadTargetCommand.runOnWorkspace({
          workspaceId: WORKSPACE_ID,
          dataSource,
          index: 0,
          total: 1,
          options: {},
        }),
      buildSystemAuthContext(WORKSPACE_ID),
    );
    await dataSource.query(
      `DELETE FROM "${SCHEMA}"."agentChatThread" WHERE id = $1`,
      [threadId],
    );
    await dataSource.query('DELETE FROM core."agentChatThread" WHERE id = $1', [
      threadId,
    ]);
    expect(await describeAgentChatThreadTarget(dataSource)).toEqual(
      seededAgentChatThreadTarget,
    );
  });

  it('skips absent schemas only when no history or migration state exists', async () => {
    const workspaceId = randomUUID();
    const ownerId = randomUUID();
    const legacyThreadId = randomUUID();
    const args = {
      workspaceId,
      dataSource,
      index: 0,
      total: 1,
      options: {},
    };
    await dataSource.query(
      `INSERT INTO core."workspace" (id, "activationStatus", "databaseSchema", "subdomain", "workspaceCustomApplicationId", "defaultRoleId")
       SELECT $1::uuid, 'CREATED', $2, $1::text, "workspaceCustomApplicationId", "defaultRoleId"
       FROM core."workspace" WHERE id = $3`,
      [workspaceId, getWorkspaceSchemaName(workspaceId), WORKSPACE_ID],
    );
    try {
      await expect(command.up(args)).resolves.toBeUndefined();
      expect(
        await dataSource.query(
          'SELECT 1 FROM core."keyValuePair" WHERE "workspaceId" = $1 AND key = $2',
          [workspaceId, AGENT_HISTORY_STORAGE_KEY],
        ),
      ).toHaveLength(0);
      expect(
        await dataSource.query(
          'SELECT 1 FROM core."objectMetadata" WHERE "workspaceId" = $1',
          [workspaceId],
        ),
      ).toHaveLength(0);
      await dataSource.transaction(async (manager) => {
        await storage.writeState(manager.queryRunner!, workspaceId, {
          storage: 'workspace',
        });
      });
      await expect(command.up(args)).rejects.toThrow(/schema is missing/i);
      await dataSource.transaction(async (manager) => {
        await storage.writeState(manager.queryRunner!, workspaceId, {
          storage: 'core',
          migration: {
            phase: 'copying',
            target: 'workspace',
            tableIndex: 0,
            lastId: null,
          },
        });
      });
      await expect(command.up(args)).rejects.toThrow(/schema is missing/i);
      await dataSource.query(
        'DELETE FROM core."keyValuePair" WHERE "workspaceId" = $1 AND key = $2',
        [workspaceId, AGENT_HISTORY_STORAGE_KEY],
      );
      await dataSource.query(
        `INSERT INTO core."userWorkspace" (id, "workspaceId", "userId")
         SELECT $1, $2, "userId" FROM core."userWorkspace" WHERE "workspaceId" = $3 LIMIT 1`,
        [ownerId, workspaceId, WORKSPACE_ID],
      );
      await dataSource.query(
        'INSERT INTO core."agentChatThread" (id, "workspaceId", "userWorkspaceId") VALUES ($1, $2, $3)',
        [legacyThreadId, workspaceId, ownerId],
      );
      await expect(command.up(args)).rejects.toThrow(/schema is missing/i);
      expect(
        await dataSource.query(
          'SELECT id FROM core."agentChatThread" WHERE id = $1',
          [legacyThreadId],
        ),
      ).toEqual([{ id: legacyThreadId }]);
      await dataSource.query(
        'DELETE FROM core."agentChatThread" WHERE id = $1',
        [legacyThreadId],
      );
      // Legacy foreign keys do not enforce matching workspace IDs on children.
      await dataSource.query(
        'INSERT INTO core."agentTurn" (id, "workspaceId", "threadId") VALUES ($1, $2, $3)',
        [randomUUID(), workspaceId, threadId],
      );
      await expect(command.up(args)).rejects.toThrow(/schema is missing/i);
    } finally {
      await dataSource.query('DELETE FROM core."workspace" WHERE id = $1', [
        workspaceId,
      ]);
    }
  });

  it('is discovered by upgrade, prepares missing objects, preserves live streams, recovers interrupted streams and supports reverse copy', async () => {
    await expect(runCommand('up', true)).rejects.toThrow(/stream/i);
    expect(
      await dataSource.query(
        'SELECT id FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = ANY($2)',
        [WORKSPACE_ID, AGENT_HISTORY_TABLES.map(({ name }) => name)],
      ),
    ).toHaveLength(0);

    await heartbeat.markClaimed(streamId);
    await expect(runCommand('up')).rejects.toThrow(/stream/i);
    expect(
      await dataSource.query(
        'SELECT status FROM core."upgradeMigration" WHERE "workspaceId" = $1 AND name = $2 ORDER BY attempt DESC LIMIT 1',
        [WORKSPACE_ID, upgradeCommandName],
      ),
    ).toEqual([{ status: 'failed' }]);
    await storage.run(WORKSPACE_ID, async ({ storage: selected }) => {
      expect(selected).toBe('core');
    });
    expect(
      await dataSource.query(
        'SELECT id FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = ANY($2)',
        [WORKSPACE_ID, AGENT_HISTORY_TABLES.map(({ name }) => name)],
      ),
    ).toHaveLength(5);

    await heartbeat.clear(streamId);
    await runCommand('up');
    await runCommand('up');
    expect(
      await dataSource.query(
        'SELECT status FROM core."upgradeMigration" WHERE "workspaceId" = $1 AND name = $2 ORDER BY attempt DESC LIMIT 1',
        [WORKSPACE_ID, upgradeCommandName],
      ),
    ).toEqual([{ status: 'completed' }]);
    await storage.run(WORKSPACE_ID, async ({ storage: selected }) => {
      expect(selected).toBe('workspace');
    });
    expect(
      await dataSource.query(
        `SELECT title, "activeStreamId", "lastStreamError"->>'code' AS error FROM "${SCHEMA}"."agentChatThread" WHERE id = $1`,
        [threadId],
      ),
    ).toEqual([
      {
        title: 'History before upgrade',
        activeStreamId: null,
        error: 'STREAM_INTERRUPTED',
      },
    ]);

    await dataSource.query(
      `UPDATE "${SCHEMA}"."agentChatThread" SET title = 'History after upgrade' WHERE id = $1`,
      [threadId],
    );
    await runCommand('down');
    expect(
      await dataSource.query(
        'SELECT title FROM core."agentChatThread" WHERE id = $1',
        [threadId],
      ),
    ).toEqual([{ title: 'History after upgrade' }]);
  });
});
