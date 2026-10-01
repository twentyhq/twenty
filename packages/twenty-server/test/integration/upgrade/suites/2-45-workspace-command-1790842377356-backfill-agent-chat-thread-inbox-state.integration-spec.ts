import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type AddAgentChatThreadParticipantObjectCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790842377355-add-agent-chat-thread-participant-object.command';
import { type BackfillAgentChatThreadInboxStateCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790842377356-backfill-agent-chat-thread-inbox-state.command';
import { type UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const CREATED_AT = new Date('2026-01-01T00:00:00.000Z');
const LAST_VISIBLE_MESSAGE_AT = new Date('2026-01-02T00:00:00.000Z');
const HIDDEN_MESSAGE_AT = new Date('2026-01-03T00:00:00.000Z');
const ARCHIVED_AT = new Date('2026-01-05T00:00:00.000Z');

type StoredParticipant = {
  threadId: string;
  workspaceMemberId: string;
  lastReadAt: Date | null;
  archivedAt: Date | null;
};

describe('2-45 workspace commands - agent chat thread inbox state (integration)', () => {
  let objectCommand: AddAgentChatThreadParticipantObjectCommand;
  let backfillCommand: BackfillAgentChatThreadInboxStateCommand;
  let workspaceOrmManager: WorkspaceOrmManager;

  const sharedThreadId = randomUUID();
  const emptyThreadId = randomUUID();
  const legacyArchivedThreadId = randomUUID();
  const deletedThreadId = randomUUID();
  const threadIds = [
    sharedThreadId,
    emptyThreadId,
    legacyArchivedThreadId,
    deletedThreadId,
  ];

  const runCommand = (
    command:
      | AddAgentChatThreadParticipantObjectCommand
      | BackfillAgentChatThreadInboxStateCommand,
    direction: 'up' | 'down',
  ) =>
    workspaceOrmManager.executeInWorkspaceContext(
      () => command[direction](RUN_ON_WORKSPACE_ARGS),
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

  const insertThread = (
    id: string,
    { archivedAt, deletedAt }: { archivedAt?: Date; deletedAt?: Date } = {},
  ) =>
    global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentChatThread" (id, title, "workspaceMemberId", "createdAt", "archivedAt", "deletedAt")
       VALUES ($1, 'Inbox state backfill', $2, $3, $4, $5)`,
      [
        id,
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        CREATED_AT,
        archivedAt ?? null,
        deletedAt ?? null,
      ],
    );

  const insertMessage = (
    threadId: string,
    { createdAt, isHidden }: { createdAt: Date; isHidden: boolean },
  ) =>
    global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentMessage" ("threadId", role, status, "isHidden", "createdAt")
       VALUES ($1, 'assistant', 'sent', $2, $3)`,
      [threadId, isHidden, createdAt],
    );

  const readThreads = async () => {
    const rows: {
      id: string;
      lastActivityAt: Date | null;
      deletedAt: Date | null;
    }[] = await global.testDataSource.query(
      `SELECT id, "lastActivityAt", "deletedAt" FROM ${SCHEMA}."agentChatThread" WHERE id = ANY($1)`,
      [threadIds],
    );

    return Object.fromEntries(rows.map((row) => [row.id, row]));
  };

  const readParticipants = async (): Promise<StoredParticipant[]> =>
    global.testDataSource.query(
      `SELECT "threadId", "workspaceMemberId", "lastReadAt", "archivedAt"
       FROM ${SCHEMA}."agentChatThreadParticipant" WHERE "threadId" = ANY($1)`,
      [threadIds],
    );

  beforeAll(async () => {
    objectCommand =
      getAppProviderByClassName<AddAgentChatThreadParticipantObjectCommand>(
        'AddAgentChatThreadParticipantObjectCommand',
      );
    backfillCommand =
      getAppProviderByClassName<BackfillAgentChatThreadInboxStateCommand>(
        'BackfillAgentChatThreadInboxStateCommand',
      );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );

    // What a workspace that has not run the 2.45 commands yet looks like
    await runCommand(backfillCommand, 'down');
    await runCommand(objectCommand, 'down');

    await insertThread(sharedThreadId);
    await insertThread(emptyThreadId);
    await insertThread(legacyArchivedThreadId, {
      archivedAt: ARCHIVED_AT,
      deletedAt: ARCHIVED_AT,
    });
    await insertThread(deletedThreadId, { deletedAt: ARCHIVED_AT });

    await insertMessage(sharedThreadId, {
      createdAt: LAST_VISIBLE_MESSAGE_AT,
      isHidden: false,
    });
    await insertMessage(sharedThreadId, {
      createdAt: HIDDEN_MESSAGE_AT,
      isHidden: true,
    });
    await insertMessage(legacyArchivedThreadId, {
      createdAt: LAST_VISIBLE_MESSAGE_AT,
      isHidden: false,
    });

    const cache = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    const { flatObjectMetadataMaps } = await cache.getOrRecompute(
      SEED_APPLE_WORKSPACE_ID,
      ['flatObjectMetadataMaps'],
    );

    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."recordShare" ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
       VALUES ($1, $2, $3, 'WORKSPACE_MEMBER', 'READ', 'MANUAL', $4)`,
      [
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThread.universalIdentifier
        ]!.id,
        sharedThreadId,
        WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      ],
    );

    await runCommand(objectCommand, 'up');
    await runCommand(backfillCommand, 'up');
  });

  afterAll(async () => {
    await runCommand(objectCommand, 'up');
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."agentMessage" WHERE "threadId" = ANY($1)`,
      [threadIds],
    );
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."agentChatThread" WHERE id = ANY($1)`,
      [threadIds],
    );
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."recordShare" WHERE "recordId" = ANY($1)`,
      [threadIds],
    );
  });

  it('registers both commands in order for 2.45.0', () => {
    const registry = getAppProviderByClassName<UpgradeCommandRegistryService>(
      'UpgradeCommandRegistryService',
    );
    const { workspaceCommands } = registry.getBundleForVersion('2.45.0');
    const positions = [objectCommand, backfillCommand].map((command) =>
      workspaceCommands.findIndex(
        (registeredCommand) => registeredCommand.command === command,
      ),
    );

    expect(positions).not.toContain(-1);
    expect(positions[0]).toBeLessThan(positions[1]);
  });

  it('dates each thread by its last visible message, or its creation', async () => {
    const threads = await readThreads();

    expect(threads[sharedThreadId].lastActivityAt).toEqual(
      LAST_VISIBLE_MESSAGE_AT,
    );
    expect(threads[emptyThreadId].lastActivityAt).toEqual(CREATED_AT);
  });

  it('starts every member who could read a thread with it read', async () => {
    const participants = await readParticipants();
    const sharedThreadReaders = participants
      .filter(({ threadId }) => threadId === sharedThreadId)
      .map(({ workspaceMemberId, lastReadAt }) => ({
        workspaceMemberId,
        lastReadAt,
      }));

    expect(sharedThreadReaders).toEqual(
      expect.arrayContaining([
        {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          lastReadAt: LAST_VISIBLE_MESSAGE_AT,
        },
        {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          lastReadAt: LAST_VISIBLE_MESSAGE_AT,
        },
      ]),
    );
    expect(sharedThreadReaders).toHaveLength(2);
  });

  it('turns chats 2.44 archived into the trash back into archives for their owner', async () => {
    const threads = await readThreads();
    const owner = (await readParticipants()).find(
      ({ threadId }) => threadId === legacyArchivedThreadId,
    );

    expect(threads[legacyArchivedThreadId].deletedAt).toBeNull();
    expect(owner?.archivedAt).toEqual(ARCHIVED_AT);
    expect(threads[deletedThreadId].deletedAt).toEqual(ARCHIVED_AT);
  });

  it('changes nothing when it runs again', async () => {
    const participantsBefore = await readParticipants();

    await runCommand(objectCommand, 'up');
    await runCommand(backfillCommand, 'up');

    expect(await readParticipants()).toEqual(
      expect.arrayContaining(participantsBefore),
    );
    expect(await readParticipants()).toHaveLength(participantsBefore.length);
  });

  it('moves the archived chats back to the trash on the way down', async () => {
    await runCommand(backfillCommand, 'down');

    const threads = await readThreads();

    expect(threads[legacyArchivedThreadId].deletedAt).not.toBeNull();
    expect(threads[sharedThreadId].deletedAt).toBeNull();

    await runCommand(backfillCommand, 'up');
  });
});
