import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type AddAgentChatThreadParticipantObjectCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1790942019631-add-agent-chat-thread-participant-object.command';
import { type BackfillAgentChatThreadInboxStateCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1790942019632-backfill-agent-chat-thread-inbox-state.command';
import { type AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { type UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

const getAgentChatThreadService = () =>
  getAppProviderByClassName<AgentChatThreadService>('AgentChatThreadService');

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const CREATED_AT = new Date('2026-01-01T00:00:00.000Z');
const LEGACY_USER_MESSAGE_AT = new Date('2026-01-01T10:00:00.000Z');
const MEMBER_MESSAGE_AT = new Date('2026-01-01T11:00:00.000Z');
const LAST_VISIBLE_MESSAGE_AT = new Date('2026-01-02T00:00:00.000Z');
const HIDDEN_MESSAGE_AT = new Date('2026-01-03T00:00:00.000Z');
const ARCHIVED_AT = new Date('2026-01-05T00:00:00.000Z');
const MOVED_TO_TRASH_AT = new Date('2026-01-10T00:00:00.000Z');
const MOVE_RECORDED_AT = new Date('2026-01-10T00:01:00.000Z');
const DELETED_AGAIN_AT = new Date('2026-01-20T00:00:00.000Z');
const MOVE_MIGRATION_NAME =
  '2.44.0_MoveAgentChatThreadsToRecordModelCommand_1790751626421';

type StoredParticipant = {
  threadId: string;
  workspaceMemberId: string;
  lastReadAt: Date | null;
  archivedAt: Date | null;
};

describe('2-46 workspace commands - agent chat thread inbox state (integration)', () => {
  let objectCommand: AddAgentChatThreadParticipantObjectCommand;
  let backfillCommand: BackfillAgentChatThreadInboxStateCommand;
  let workspaceOrmManager: WorkspaceOrmManager;

  const sharedThreadId = randomUUID();
  const emptyThreadId = randomUUID();
  const legacyArchivedThreadId = randomUUID();
  const deletedThreadId = randomUUID();
  const deletedAgainThreadId = randomUUID();
  const createdBeforeUpgradeThreadId = randomUUID();
  let beforeUpgrade: {
    createdThreadLastActivityAt: string | null;
    recordedLastActivityAt: Date | null;
  };
  const threadIds = [
    createdBeforeUpgradeThreadId,
    sharedThreadId,
    emptyThreadId,
    legacyArchivedThreadId,
    deletedThreadId,
    deletedAgainThreadId,
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

  const insertMessage = async (
    threadId: string,
    {
      createdAt,
      isHidden,
      role = 'assistant',
      text,
      senderWorkspaceMemberId = null,
    }: {
      createdAt: Date;
      isHidden: boolean;
      role?: 'user' | 'assistant';
      text?: string;
      senderWorkspaceMemberId?: string | null;
    },
  ) => {
    const messageId = randomUUID();

    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentMessage" (id, "threadId", role, status, "isHidden", "createdAt", "senderWorkspaceMemberId")
       VALUES ($1, $2, $3, 'sent', $4, $5, $6)`,
      [messageId, threadId, role, isHidden, createdAt, senderWorkspaceMemberId],
    );

    if (text !== undefined) {
      await global.testDataSource.query(
        `INSERT INTO ${SCHEMA}."agentMessagePart" ("messageId", "orderIndex", type, "textContent")
         VALUES ($1, 0, 'text', $2)`,
        [messageId, text],
      );
    }
  };

  const readThreads = async () => {
    const rows: {
      id: string;
      lastActivityAt: Date | null;
      deletedAt: Date | null;
      lastMessageText: string | null;
      lastMessageSenderWorkspaceMemberId: string | null;
      writerWorkspaceMemberIds: string[] | null;
    }[] = await global.testDataSource.query(
      `SELECT id, "lastActivityAt", "deletedAt", "lastMessageText", "lastMessageSenderWorkspaceMemberId", "writerWorkspaceMemberIds"
       FROM ${SCHEMA}."agentChatThread" WHERE id = ANY($1)`,
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

  const readOwnerShares = async () => {
    const rows: { principalId: string; workspaceMemberId: string }[] =
      await global.testDataSource.query(
        `SELECT share."principalId", participant."workspaceMemberId"
         FROM ${SCHEMA}."recordShare" share
         JOIN ${SCHEMA}."agentChatThreadParticipant" participant ON participant.id = share."recordId"
         WHERE participant."threadId" = ANY($1) AND share."rowCause" = 'OWNER'`,
        [threadIds],
      );

    return rows;
  };

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

    // What a workspace that has not run the 2.46 commands yet looks like
    await runCommand(backfillCommand, 'down');
    await runCommand(objectCommand, 'down');

    const participantService =
      getAppProviderByClassName<AgentChatThreadParticipantService>(
        'AgentChatThreadParticipantService',
      );
    const createdThread = await getAgentChatThreadService().createThread({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      id: createdBeforeUpgradeThreadId,
      title: 'Created before the upgrade',
    });
    const { lastActivityAt } = await participantService.recordMemberActivity({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      threadId: createdBeforeUpgradeThreadId,
      text: 'Sent before the upgrade',
    });

    beforeUpgrade = {
      createdThreadLastActivityAt: createdThread.lastActivityAt ?? null,
      recordedLastActivityAt: lastActivityAt,
    };

    await insertThread(sharedThreadId);
    await insertThread(emptyThreadId);
    await insertThread(legacyArchivedThreadId, {
      archivedAt: ARCHIVED_AT,
      deletedAt: MOVED_TO_TRASH_AT,
    });
    await insertThread(deletedThreadId, { deletedAt: ARCHIVED_AT });
    // Moved to the trash by 2.44, restored by its owner, then deleted again
    await insertThread(deletedAgainThreadId, {
      archivedAt: ARCHIVED_AT,
      deletedAt: DELETED_AGAIN_AT,
    });
    await global.testDataSource.query(
      `INSERT INTO core."upgradeMigration" (name, status, attempt, "executedByVersion", "workspaceId", "createdAt")
       VALUES ($1, 'completed', 99, '2.44.0', $2, $3)`,
      [MOVE_MIGRATION_NAME, SEED_APPLE_WORKSPACE_ID, MOVE_RECORDED_AT],
    );

    // A user message without a sender predates multiplayer chats and was
    // the owner's
    await insertMessage(sharedThreadId, {
      createdAt: LEGACY_USER_MESSAGE_AT,
      isHidden: false,
      role: 'user',
      text: 'An older message without a sender',
    });
    await insertMessage(sharedThreadId, {
      createdAt: MEMBER_MESSAGE_AT,
      isHidden: false,
      role: 'user',
      text: 'Can you check the Stripe renewal?',
      senderWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    });
    await insertMessage(sharedThreadId, {
      createdAt: LAST_VISIBLE_MESSAGE_AT,
      isHidden: false,
      text: 'The renewal is due next week.',
    });
    await insertMessage(sharedThreadId, {
      createdAt: HIDDEN_MESSAGE_AT,
      isHidden: true,
      role: 'user',
      text: 'A hidden message',
      senderWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
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

    for (const threadId of [sharedThreadId, legacyArchivedThreadId]) {
      await global.testDataSource.query(
        `INSERT INTO ${SCHEMA}."recordShare" ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
         VALUES ($1, $2, $3, 'WORKSPACE_MEMBER', 'READ', 'MANUAL', $4)`,
        [
          flatObjectMetadataMaps.byUniversalIdentifier[
            STANDARD_OBJECTS.agentChatThread.universalIdentifier
          ]!.id,
          threadId,
          WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        ],
      );
    }

    await runCommand(objectCommand, 'up');
    await runCommand(backfillCommand, 'up');
  });

  afterAll(async () => {
    await runCommand(objectCommand, 'up');
    await runCommand(backfillCommand, 'up');
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."recordShare" share
       USING ${SCHEMA}."agentChatThreadParticipant" participant
       WHERE participant.id = share."recordId" AND participant."threadId" = ANY($1)`,
      [threadIds],
    );
    await global.testDataSource.query(
      `DELETE FROM core."upgradeMigration" WHERE name = $1 AND attempt = 99 AND "workspaceId" = $2`,
      [MOVE_MIGRATION_NAME, SEED_APPLE_WORKSPACE_ID],
    );
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

  it('registers both commands in order for 2.46.0', () => {
    const registry = getAppProviderByClassName<UpgradeCommandRegistryService>(
      'UpgradeCommandRegistryService',
    );
    const { workspaceCommands } = registry.getBundleForVersion('2.46.0');
    const positions = [objectCommand, backfillCommand].map((command) =>
      workspaceCommands.findIndex(
        (registeredCommand) => registeredCommand.command === command,
      ),
    );

    expect(positions).not.toContain(-1);
    const [objectPosition, backfillPosition] = positions;

    jestExpectToBeDefined(objectPosition);
    jestExpectToBeDefined(backfillPosition);

    expect(objectPosition).toBeLessThan(backfillPosition);
  });

  it('dates each thread by its last visible message, or its creation', async () => {
    const threads = await readThreads();

    expect(threads[sharedThreadId]?.lastActivityAt).toEqual(
      LAST_VISIBLE_MESSAGE_AT,
    );
    expect(threads[emptyThreadId]?.lastActivityAt).toEqual(CREATED_AT);
  });

  it('keeps the last visible message and who wrote in each thread', async () => {
    const threads = await readThreads();

    expect(threads[sharedThreadId]).toMatchObject({
      lastMessageText: 'The renewal is due next week.',
      lastMessageSenderWorkspaceMemberId: null,
    });
    expect(
      [...threads[sharedThreadId]?.writerWorkspaceMemberIds!].sort(),
    ).toEqual(
      [
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      ].sort(),
    );
    expect(threads[emptyThreadId]).toMatchObject({
      lastMessageText: null,
      writerWorkspaceMemberIds: null,
    });
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

  it('turns chats 2.44 archived into the trash back into archives for everyone who could read them', async () => {
    const threads = await readThreads();
    const readers = (await readParticipants())
      .filter(({ threadId }) => threadId === legacyArchivedThreadId)
      .map(({ workspaceMemberId, archivedAt }) => ({
        workspaceMemberId,
        archivedAt,
      }));

    expect(threads[legacyArchivedThreadId]?.deletedAt).toBeNull();
    expect(readers).toEqual(
      expect.arrayContaining([
        {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          archivedAt: ARCHIVED_AT,
        },
        {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          archivedAt: ARCHIVED_AT,
        },
      ]),
    );
    expect(readers).toHaveLength(2);
    expect(threads[deletedThreadId]?.deletedAt).toEqual(ARCHIVED_AT);
  });

  it('grants each participant row to its member, and only them', async () => {
    const participants = await readParticipants();
    const ownerShares = await readOwnerShares();

    expect(ownerShares).toHaveLength(participants.length);
    ownerShares.forEach(({ principalId, workspaceMemberId }) =>
      expect(principalId).toBe(workspaceMemberId),
    );
  });

  it('leaves a chat its owner deleted again after the 2.44 move in the trash', async () => {
    const threads = await readThreads();

    expect(threads[deletedAgainThreadId]?.deletedAt).toEqual(DELETED_AGAIN_AT);
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

    expect(threads[legacyArchivedThreadId]?.deletedAt).toEqual(
      MOVE_RECORDED_AT,
    );
    expect(threads[sharedThreadId]?.deletedAt).toBeNull();
    expect(await readOwnerShares()).toEqual([]);

    await runCommand(backfillCommand, 'up');

    expect((await readThreads())[legacyArchivedThreadId]?.deletedAt).toBeNull();
    expect(await readOwnerShares()).toHaveLength(
      (await readParticipants()).length,
    );
  });

  it('keeps chats working on a workspace the upgrade has not reached yet', () => {
    expect(beforeUpgrade.createdThreadLastActivityAt).toBeNull();
    expect(beforeUpgrade.recordedLastActivityAt).toBeNull();
  });
});
