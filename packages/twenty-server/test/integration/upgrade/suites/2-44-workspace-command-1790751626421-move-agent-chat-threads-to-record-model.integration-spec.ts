import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataWritability } from 'twenty-shared/types';

import { type MoveAgentChatThreadsToRecordModelCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790751626421-move-agent-chat-threads-to-record-model.command';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const getAgentChatThreadService = () =>
  getAppProviderByClassName<AgentChatThreadService>('AgentChatThreadService');

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const CHAT_FIELDS = STANDARD_OBJECTS.agentChatThread.fields;
const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const ARCHIVED_AT = new Date('2026-01-01T00:00:00.000Z');
const PREVIOUSLY_DELETED_AT = new Date('2026-02-01T00:00:00.000Z');

type StoredThread = {
  id: string;
  archivedAt: Date | null;
  deletedAt: Date | null;
};

describe('2-44 workspace command 1790751626421 - MoveAgentChatThreadsToRecordModelCommand (integration)', () => {
  let command: MoveAgentChatThreadsToRecordModelCommand;
  let workspaceOrmManager: WorkspaceOrmManager;
  let workspaceCacheService: WorkspaceCacheService;

  const archivedThreadId = randomUUID();
  const archivedAndDeletedThreadId = randomUUID();
  const liveThreadId = randomUUID();
  const threadIds = [
    archivedThreadId,
    archivedAndDeletedThreadId,
    liveThreadId,
  ];

  const runCommand = (direction: 'up' | 'down') =>
    workspaceOrmManager.executeInWorkspaceContext(
      () => command[direction](RUN_ON_WORKSPACE_ARGS),
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

  const readMetadataState = async () => {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);
    const chatObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];

    return {
      labelSingular: chatObject?.labelSingular,
      labelPlural: chatObject?.labelPlural,
      isUIEditable: chatObject?.isUIEditable,
      labelIdentifierFieldMetadataUniversalIdentifier:
        chatObject?.labelIdentifierFieldMetadataUniversalIdentifier,
      isTitleUIEditable:
        flatFieldMetadataMaps.byUniversalIdentifier[
          CHAT_FIELDS.title.universalIdentifier
        ]?.isUIEditable,
      archivedAtWritability:
        flatFieldMetadataMaps.byUniversalIdentifier[
          CHAT_FIELDS.archivedAt.universalIdentifier
        ]?.writability,
    };
  };

  const readThreads = async (): Promise<Record<string, StoredThread>> => {
    const rows: StoredThread[] = await global.testDataSource.query(
      `SELECT id, "archivedAt", "deletedAt" FROM ${SCHEMA}."agentChatThread" WHERE id = ANY($1)`,
      [threadIds],
    );

    return Object.fromEntries(rows.map((row) => [row.id, row]));
  };

  beforeAll(async () => {
    command =
      getAppProviderByClassName<MoveAgentChatThreadsToRecordModelCommand>(
        'MoveAgentChatThreadsToRecordModelCommand',
      );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );

    await runCommand('down');

    for (const threadId of threadIds) {
      await getAgentChatThreadService().createThread({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        id: threadId,
        title: 'Chat moved to the record model',
      });
    }
    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."agentChatThread" SET "archivedAt" = $2 WHERE id = $1`,
      [archivedThreadId, ARCHIVED_AT],
    );
    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."agentChatThread" SET "archivedAt" = $2, "deletedAt" = $3 WHERE id = $1`,
      [archivedAndDeletedThreadId, ARCHIVED_AT, PREVIOUSLY_DELETED_AT],
    );
  });

  afterAll(async () => {
    await runCommand('up');
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."agentChatThread" WHERE id = ANY($1)`,
      [threadIds],
    );
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."recordShare" WHERE "recordId" = ANY($1)`,
      [threadIds],
    );
  });

  it('starts from a workspace where chats are archived agent chat threads', async () => {
    expect(await readMetadataState()).toEqual({
      labelSingular: 'Agent chat thread',
      labelPlural: 'Agent chat threads',
      isUIEditable: false,
      labelIdentifierFieldMetadataUniversalIdentifier:
        CHAT_FIELDS.id.universalIdentifier,
      isTitleUIEditable: false,
      archivedAtWritability: MetadataWritability.OPEN,
    });
  });

  it('moves archived chats to the trash and gives chats their record shape', async () => {
    const startedAt = new Date();

    await runCommand('up');

    expect(await readMetadataState()).toEqual({
      labelSingular: 'Chat',
      labelPlural: 'Chats',
      isUIEditable: true,
      labelIdentifierFieldMetadataUniversalIdentifier:
        CHAT_FIELDS.title.universalIdentifier,
      isTitleUIEditable: true,
      archivedAtWritability: MetadataWritability.SYSTEM,
    });

    const threads = await readThreads();

    // Trashed as of the upgrade, so trash cleanup does not purge old archives
    expect(threads[archivedThreadId].archivedAt).toEqual(ARCHIVED_AT);
    expect(
      threads[archivedThreadId].deletedAt!.getTime(),
    ).toBeGreaterThanOrEqual(startedAt.getTime() - 1000);
    expect(threads[archivedAndDeletedThreadId]).toMatchObject({
      archivedAt: null,
      deletedAt: PREVIOUSLY_DELETED_AT,
    });
    expect(threads[liveThreadId]).toMatchObject({
      archivedAt: null,
      deletedAt: null,
    });
  });

  it('is a no-op when run again', async () => {
    const metadataBefore = await readMetadataState();
    const threadsBefore = await readThreads();

    await runCommand('up');

    expect(await readMetadataState()).toEqual(metadataBefore);
    expect(await readThreads()).toEqual(threadsBefore);
  });

  it('rolls back only the chats it moved to the trash', async () => {
    const deletedAfterUpgradeAt = new Date('2026-03-01T00:00:00.000Z');

    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."agentChatThread" SET "deletedAt" = $2 WHERE id = $1`,
      [liveThreadId, deletedAfterUpgradeAt],
    );

    await runCommand('down');

    const threads = await readThreads();

    expect(threads[archivedThreadId]).toMatchObject({
      archivedAt: ARCHIVED_AT,
      deletedAt: null,
    });
    expect(threads[archivedAndDeletedThreadId]).toMatchObject({
      archivedAt: null,
      deletedAt: PREVIOUSLY_DELETED_AT,
    });
    expect(threads[liveThreadId]).toMatchObject({
      archivedAt: null,
      deletedAt: deletedAfterUpgradeAt,
    });
  });
});
