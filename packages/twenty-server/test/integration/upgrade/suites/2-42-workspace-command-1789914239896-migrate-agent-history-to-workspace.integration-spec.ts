import { type EnableCommonRecordSharingCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790312694997-enable-common-record-sharing.command';
import { type LinkChatThreadsToWorkspaceMembersCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790360612188-link-chat-threads-to-workspace-members.command';
import { type AddWorkflowRunToChatThreadsCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790607161319-add-workflow-run-to-chat-threads.command';
import { type OpenAgentChatThreadArchivedAtWritabilityCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790672076234-open-agent-chat-thread-archived-at-writability.command';
import { type MoveAgentChatThreadsToRecordModelCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790751626421-move-agent-chat-threads-to-record-model.command';
import { type AddChatRecordPageCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790751626422-add-chat-record-page-command-menu-items.command';
import { type AddChatRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790756589463-add-chat-record-page.command';
import { type AddAgentChatThreadParticipantObjectCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1790942019631-add-agent-chat-thread-participant-object.command';
import { type BackfillAgentChatThreadInboxStateCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1790942019632-backfill-agent-chat-thread-inbox-state.command';
import { type AddAiChatInboxCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1790942019633-add-ai-chat-inbox-command-menu-items.command';
import { type DropWorkflowRunFromChatThreadsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791208395308-drop-workflow-run-from-chat-threads.command';
import { type AddAgentTurnRunFieldsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791227584393-add-agent-turn-run-fields.command';
import { type AddAgentChatThreadSubscriptionsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791322315043-add-agent-chat-thread-subscriptions.command';
import { type AddAgentChatThreadAssigneeCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791385745099-add-agent-chat-thread-assignee.command';
import { type UnfollowChatsMembersOnlyReadCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791728623417-unfollow-chats-members-only-read.command';
import { type AddAgentChatChannelsCommand } from 'src/database/commands/upgrade-version-command/2-51/2-51-workspace-command-1792686629823-add-agent-chat-channels.command';
import { randomUUID } from 'node:crypto';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { restoreLegacyChatMembershipColumns } from 'test/integration/utils/restore-legacy-chat-membership-columns.util';
import { type DataSource } from 'typeorm';

import { ACTIVE_AGENT_HISTORY_TABLES } from 'src/database/commands/agent-history/agent-history-tables.constant';
import { type MigrateAgentHistoryToWorkspaceCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789914239896-migrate-agent-history-to-workspace.command';
import { DropCoreAgentHistoryTablesFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-instance-command-fast-1791094130961-drop-core-agent-history-tables';
import { type DropLegacyChatColumnsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791730401449-drop-legacy-chat-columns.command';
import { type AddAgentMessageReactionObjectCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1792072097024-add-agent-message-reaction-object.command';
import { type ProvisionAgentChatThreadTargetCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790317893308-provision-agent-chat-thread-target.command';
import { type UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { type WorkspaceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/workspace-command-runner.service';
import { type UpgradeStatusService } from 'src/engine/core-modules/upgrade/services/upgrade-status.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type AgentChatStreamHeartbeatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-heartbeat.service';
import { AGENT_HISTORY_MIGRATION_STORAGE_KEY } from 'src/database/commands/agent-history/agent-history-migration-storage-key.constant';
import { type AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;
const SCHEMA = getWorkspaceSchemaName(WORKSPACE_ID);

const describeAgentChatThreadOwners = (dataSource: DataSource) =>
  dataSource.query<{ id: string; workspaceMemberId: string }[]>(
    `SELECT id, "workspaceMemberId" FROM "${SCHEMA}"."agentChatThread"
     WHERE "workspaceMemberId" IS NOT NULL ORDER BY id`,
  );

const describeAgentMessageSenders = (dataSource: DataSource) =>
  dataSource.query<{ id: string; senderWorkspaceMemberId: string }[]>(
    `SELECT id, "senderWorkspaceMemberId" FROM "${SCHEMA}"."agentMessage"
     WHERE "senderWorkspaceMemberId" IS NOT NULL ORDER BY id`,
  );

const describeAgentHistoryColumns = ({
  dataSource,
  objectNames,
}: {
  dataSource: DataSource;
  objectNames: string[];
}) =>
  dataSource.query<{ objectName: string; columnName: string }[]>(
    `SELECT table_name AS "objectName", column_name AS "columnName"
     FROM information_schema.columns
     WHERE table_schema = $1 AND table_name = ANY($2)
     ORDER BY 1, 2`,
    [SCHEMA, objectNames],
  );

// The link object 2.43 adds on top of agent history.
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
  let storage: AgentHistoryUpgradeStorageService;
  let heartbeat: AgentChatStreamHeartbeatService;
  let upgradeRunner: WorkspaceCommandRunnerService;
  let upgradeCommandName: string;
  let provisionAgentChatThreadTargetCommand: ProvisionAgentChatThreadTargetCommand;
  let seededAgentChatThreadTarget: Awaited<
    ReturnType<typeof describeAgentChatThreadTarget>
  >;
  let seededHistoryObjectNames: string[];
  let seededHistoryColumns: Awaited<
    ReturnType<typeof describeAgentHistoryColumns>
  >;
  let seededAgentChatThreadOwners: Awaited<
    ReturnType<typeof describeAgentChatThreadOwners>
  >;
  let seededAgentMessageSenders: Awaited<
    ReturnType<typeof describeAgentMessageSenders>
  >;
  let seededUpgradeMigrationIds: string[];
  const createdUpgradeMigrationIds = new Set<string>();
  const threadId = randomUUID();
  const streamId = randomUUID();

  const findUpgradeMigrationIds = async () =>
    (
      await dataSource.query<{ id: string }[]>(
        'SELECT id FROM core."upgradeMigration" WHERE "workspaceId" = $1 AND name = $2 ORDER BY id',
        [WORKSPACE_ID, upgradeCommandName],
      )
    ).map(({ id }) => id);

  const runCommand = async ({
    direction,
    dryRun = false,
  }: {
    direction: 'up' | 'down';
    dryRun?: boolean;
  }) => {
    const migrationIdsBefore = new Set(await findUpgradeMigrationIds());

    try {
      await workspaceOrmManager.executeInWorkspaceContext(async () => {
        const context = {
          workspaceId: WORKSPACE_ID,
          dataSource,
          index: 0,
          total: 1,
        };
        if (direction === 'down') {
          await command.down({ ...context, options: { dryRun } });

          return;
        }

        await upgradeRunner.runWorkspaceCommands({
          iteratorContext: context,
          options: { dryRun },
          workspaceCommands: [{ name: upgradeCommandName, command }],
        });
      }, buildSystemAuthContext(WORKSPACE_ID));
    } finally {
      for (const migrationId of await findUpgradeMigrationIds()) {
        if (!migrationIdsBefore.has(migrationId)) {
          createdUpgradeMigrationIds.add(migrationId);
        }
      }
    }
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<MigrateAgentHistoryToWorkspaceCommand>(
      'MigrateAgentHistoryToWorkspaceCommand',
    );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
    storage = getAppProviderByClassName<AgentHistoryUpgradeStorageService>(
      'AgentHistoryUpgradeStorageService',
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
    seededUpgradeMigrationIds = await findUpgradeMigrationIds();
    const owner = await owners.findOneByOrFail({ workspaceId: WORKSPACE_ID });

    seededAgentChatThreadTarget =
      await describeAgentChatThreadTarget(dataSource);
    seededAgentChatThreadOwners =
      await describeAgentChatThreadOwners(dataSource);

    // Later objects relate into history and would be stranded when the thread object is deleted.
    const historyObjectNames = ACTIVE_AGENT_HISTORY_TABLES.map(
      ({ name }) => name,
    );
    const laterObjectNames = (
      await dataSource.query<{ nameSingular: string }[]>(
        `SELECT DISTINCT objectMetadata."nameSingular"
         FROM core."fieldMetadata" fieldMetadata
         JOIN core."objectMetadata" objectMetadata ON objectMetadata.id = fieldMetadata."objectMetadataId"
         JOIN core."objectMetadata" targetObjectMetadata ON targetObjectMetadata.id = fieldMetadata."relationTargetObjectMetadataId"
         WHERE fieldMetadata."workspaceId" = $1
           AND fieldMetadata.type = 'RELATION'
           AND fieldMetadata.settings->>'relationType' = 'MANY_TO_ONE'
           AND targetObjectMetadata."nameSingular" = ANY($2)
           AND NOT objectMetadata."nameSingular" = ANY($2)`,
        [WORKSPACE_ID, historyObjectNames],
      )
    ).map(({ nameSingular }) => nameSingular);

    expect(laterObjectNames).toContain('agentChatThreadTarget');
    seededHistoryObjectNames = [
      ...historyObjectNames,
      ...laterObjectNames,
      'attachment',
    ];
    seededHistoryColumns = await describeAgentHistoryColumns({
      dataSource,
      objectNames: seededHistoryObjectNames,
    });

    // Recreate the pre-2.47 state this upgrade rolls back from: the core
    // tables, and the route 2.42 recorded on every workspace it moved
    const runner = dataSource.createQueryRunner();
    try {
      await new DropCoreAgentHistoryTablesFastInstanceCommand().down(runner);
      await storage.writeState(runner, WORKSPACE_ID, { storage: 'workspace' });
    } finally {
      await runner.release();
    }

    // Threads no member owns arrived with 2.44 and have no owner in the core tables 2.42 restores.
    await dataSource.query(
      `DELETE FROM "${SCHEMA}"."agentChatThread" WHERE "workspaceMemberId" IS NULL`,
    );
    seededAgentMessageSenders = await describeAgentMessageSenders(dataSource);
    // And the membership columns 2.47 dropped, which the rollback copies back
    await restoreLegacyChatMembershipColumns(WORKSPACE_ID);
    await runCommand({ direction: 'down' });
    await dataSource.query(
      'INSERT INTO core."agentChatThread" (id, "workspaceId", "userWorkspaceId", title, "activeStreamId") VALUES ($1, $2, $3, $4, $5)',
      [threadId, WORKSPACE_ID, owner.id, 'History before upgrade', streamId],
    );

    // Recreate a pre-upgrade workspace: history only in core, no standard or later objects installed.
    await dataSource.query(
      'DELETE FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = ANY($2)',
      [WORKSPACE_ID, [...historyObjectNames, ...laterObjectNames]],
    );
    for (const name of laterObjectNames) {
      await dataSource.query(`DROP TABLE "${SCHEMA}"."${name}"`);
    }
    for (const { name } of [...ACTIVE_AGENT_HISTORY_TABLES].reverse()) {
      await dataSource.query(`DROP TABLE "${SCHEMA}"."${name}" CASCADE`);
    }
    // Their select and actor columns leave their enum types behind the tables.
    const droppedObjectEnumTypes: { typname: string }[] =
      await dataSource.query(
        `SELECT typname FROM pg_type JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace
       WHERE nspname = $1 AND typtype = 'e' AND split_part(typname, '_', 1) = ANY($2)`,
        [SCHEMA, [...laterObjectNames, ...historyObjectNames]],
      );
    for (const { typname } of droppedObjectEnumTypes) {
      await dataSource.query(`DROP TYPE "${SCHEMA}"."${typname}"`);
    }
    // Pre-upgrade workspaces lack the attachment side too, and the deletion above only cascades its metadata.
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
      [WORKSPACE_ID, AGENT_HISTORY_MIGRATION_STORAGE_KEY],
    );
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(WORKSPACE_ID, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatCommandMenuItemMaps',
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
      // Views of the later objects went with them in the database.
      'flatViewMaps',
      'flatViewFieldGroupMaps',
      'flatViewFieldMaps',
      'flatViewFilterMaps',
    ]);
  });

  afterAll(async () => {
    await heartbeat.clear(streamId);
    // Restore the seeded workspace so later integration suites can use it.
    await dataSource.query(
      'UPDATE core."agentChatThread" SET "activeStreamId" = NULL WHERE id = $1',
      [threadId],
    );
    await runCommand({ direction: 'up' });
    await dataSource.query(
      `UPDATE "${SCHEMA}"."agentMessage" message
       SET "senderWorkspaceMemberId" = seededMessage."senderWorkspaceMemberId"
       FROM jsonb_to_recordset($1::jsonb) AS seededMessage(id uuid, "senderWorkspaceMemberId" uuid)
       WHERE message.id = seededMessage.id`,
      [JSON.stringify(seededAgentMessageSenders)],
    );
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
    await getAppProviderByClassName<EnableCommonRecordSharingCommand>(
      'EnableCommonRecordSharingCommand',
    ).up({
      workspaceId: WORKSPACE_ID,
      dataSource,
      index: 0,
      total: 1,
      options: {},
    });
    // Replay the later upgrades on the rebuilt 2.42 objects, in order, for the suites that follow.
    for (const laterCommand of [
      getAppProviderByClassName<LinkChatThreadsToWorkspaceMembersCommand>(
        'LinkChatThreadsToWorkspaceMembersCommand',
      ),
      getAppProviderByClassName<AddWorkflowRunToChatThreadsCommand>(
        'AddWorkflowRunToChatThreadsCommand',
      ),
      getAppProviderByClassName<OpenAgentChatThreadArchivedAtWritabilityCommand>(
        'OpenAgentChatThreadArchivedAtWritabilityCommand',
      ),
      getAppProviderByClassName<MoveAgentChatThreadsToRecordModelCommand>(
        'MoveAgentChatThreadsToRecordModelCommand',
      ),
      getAppProviderByClassName<AddChatRecordPageCommandMenuItemsCommand>(
        'AddChatRecordPageCommandMenuItemsCommand',
      ),
      getAppProviderByClassName<AddChatRecordPageCommand>(
        'AddChatRecordPageCommand',
      ),
      getAppProviderByClassName<AddAgentChatThreadParticipantObjectCommand>(
        'AddAgentChatThreadParticipantObjectCommand',
      ),
      getAppProviderByClassName<BackfillAgentChatThreadInboxStateCommand>(
        'BackfillAgentChatThreadInboxStateCommand',
      ),
      getAppProviderByClassName<AddAiChatInboxCommandMenuItemsCommand>(
        'AddAiChatInboxCommandMenuItemsCommand',
      ),
      getAppProviderByClassName<DropWorkflowRunFromChatThreadsCommand>(
        'DropWorkflowRunFromChatThreadsCommand',
      ),
      getAppProviderByClassName<AddAgentTurnRunFieldsCommand>(
        'AddAgentTurnRunFieldsCommand',
      ),
      getAppProviderByClassName<AddAgentChatThreadSubscriptionsCommand>(
        'AddAgentChatThreadSubscriptionsCommand',
      ),
      getAppProviderByClassName<AddAgentChatThreadAssigneeCommand>(
        'AddAgentChatThreadAssigneeCommand',
      ),
      getAppProviderByClassName<UnfollowChatsMembersOnlyReadCommand>(
        'UnfollowChatsMembersOnlyReadCommand',
      ),
      getAppProviderByClassName<DropLegacyChatColumnsCommand>(
        'DropLegacyChatColumnsCommand',
      ),
      getAppProviderByClassName<AddAgentMessageReactionObjectCommand>(
        'AddAgentMessageReactionObjectCommand',
      ),
      getAppProviderByClassName<AddAgentChatChannelsCommand>(
        'AddAgentChatChannelsCommand',
      ),
    ]) {
      await workspaceOrmManager.executeInWorkspaceContext(
        () =>
          laterCommand.up({
            workspaceId: WORKSPACE_ID,
            index: 0,
            total: 1,
            options: {},
          }),
        buildSystemAuthContext(WORKSPACE_ID),
      );
    }
    const runner = dataSource.createQueryRunner();
    try {
      await new DropCoreAgentHistoryTablesFastInstanceCommand().up(runner);
    } finally {
      await runner.release();
    }
    expect(await describeAgentChatThreadTarget(dataSource)).toEqual(
      seededAgentChatThreadTarget,
    );
    expect(
      await describeAgentHistoryColumns({
        dataSource,
        objectNames: seededHistoryObjectNames,
      }),
    ).toEqual(seededHistoryColumns);
    expect(await describeAgentChatThreadOwners(dataSource)).toEqual(
      seededAgentChatThreadOwners,
    );
    expect(await describeAgentMessageSenders(dataSource)).toEqual(
      seededAgentMessageSenders,
    );
  });

  afterAll(async () => {
    await dataSource.query(
      'DELETE FROM core."upgradeMigration" WHERE id = ANY($1::uuid[])',
      [[...createdUpgradeMigrationIds]],
    );
    await getAppProviderByClassName<UpgradeStatusService>(
      'UpgradeStatusService',
    ).invalidateInstanceAndAllWorkspacesStatus();
    expect(await findUpgradeMigrationIds()).toEqual(seededUpgradeMigrationIds);
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
          [workspaceId, AGENT_HISTORY_MIGRATION_STORAGE_KEY],
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
        [workspaceId, AGENT_HISTORY_MIGRATION_STORAGE_KEY],
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

  const readStorage = async () => {
    const runner = dataSource.createQueryRunner();
    try {
      await runner.connect();
      return (await storage.readState(runner, WORKSPACE_ID)).storage;
    } finally {
      await runner.release();
    }
  };

  it('is discovered by upgrade, prepares missing objects, preserves live streams, recovers interrupted streams and supports reverse copy', async () => {
    await expect(runCommand({ direction: 'up', dryRun: true })).rejects.toThrow(
      /stream/i,
    );
    expect(
      await dataSource.query(
        'SELECT id FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = ANY($2)',
        [WORKSPACE_ID, ACTIVE_AGENT_HISTORY_TABLES.map(({ name }) => name)],
      ),
    ).toHaveLength(0);

    await heartbeat.markClaimed(streamId);
    await expect(runCommand({ direction: 'up' })).rejects.toThrow(/stream/i);
    expect(
      await dataSource.query(
        'SELECT status FROM core."upgradeMigration" WHERE "workspaceId" = $1 AND name = $2 ORDER BY attempt DESC LIMIT 1',
        [WORKSPACE_ID, upgradeCommandName],
      ),
    ).toEqual([{ status: 'failed' }]);
    expect(await readStorage()).toBe('core');
    expect(
      await dataSource.query(
        'SELECT id FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = ANY($2)',
        [WORKSPACE_ID, ACTIVE_AGENT_HISTORY_TABLES.map(({ name }) => name)],
      ),
    ).toHaveLength(ACTIVE_AGENT_HISTORY_TABLES.length);

    await heartbeat.clear(streamId);
    await runCommand({ direction: 'up' });
    await runCommand({ direction: 'up' });
    expect(
      await dataSource.query(
        'SELECT status FROM core."upgradeMigration" WHERE "workspaceId" = $1 AND name = $2 ORDER BY attempt DESC LIMIT 1',
        [WORKSPACE_ID, upgradeCommandName],
      ),
    ).toEqual([{ status: 'completed' }]);
    expect(await readStorage()).toBe('workspace');
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
    await runCommand({ direction: 'down' });
    expect(
      await dataSource.query(
        'SELECT title FROM core."agentChatThread" WHERE id = $1',
        [threadId],
      ),
    ).toEqual([{ title: 'History after upgrade' }]);
  });
});
