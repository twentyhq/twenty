import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { type DataSource } from 'typeorm';

import { AGENT_HISTORY_TABLES } from 'src/database/commands/agent-history/agent-history-tables.constant';
import { type MigrateAgentHistoryToWorkspaceCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789914239896-migrate-agent-history-to-workspace.command';
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

jest.setTimeout(60_000);

describe('versioned agent history upgrade (integration)', () => {
  let command: MigrateAgentHistoryToWorkspaceCommand;
  let dataSource: DataSource;
  let workspaceOrmManager: WorkspaceOrmManager;
  let storage: AgentHistoryStorageService;
  let heartbeat: AgentChatStreamHeartbeatService;
  let upgradeRunner: WorkspaceCommandRunnerService;
  let upgradeCommandName: string;
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

    // Recreate a pre-upgrade workspace: history exists only in core, and none
    // of the five standard objects has been installed yet.
    await dataSource.query(
      'DELETE FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = ANY($2)',
      [WORKSPACE_ID, AGENT_HISTORY_TABLES.map(({ name }) => name)],
    );
    for (const { name } of [...AGENT_HISTORY_TABLES].reverse()) {
      await dataSource.query(`DROP TABLE "${SCHEMA}"."${name}" CASCADE`);
    }
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
    await dataSource.query(
      `DELETE FROM "${SCHEMA}"."agentChatThread" WHERE id = $1`,
      [threadId],
    );
    await dataSource.query('DELETE FROM core."agentChatThread" WHERE id = $1', [
      threadId,
    ]);
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
