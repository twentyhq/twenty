import { AddChatMessageSenderFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-instance-command-fast-1790171503074-add-chat-message-sender';
import { randomUUID } from 'node:crypto';
import { parse } from 'graphql';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { type AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { type AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { type AttributeChatMessageSendersCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790171503075-attribute-chat-message-senders.command';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const userWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.JANE;
const otherUserWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.JONY;

describe('Persisted chat senders', () => {
  let chat: AgentChatService;
  let actors: AgentChatActorService;
  const threadId = randomUUID();
  beforeAll(async () => {
    chat = getAppProviderByClassName<AgentChatService>('AgentChatService');
    actors = getAppProviderByClassName<AgentChatActorService>(
      'AgentChatActorService',
    );
    await chat.createThread({
      workspaceId,
      userWorkspaceId,
      id: threadId,
      title: 'Sender regression',
    });
  });
  afterAll(async () => {
    await chat.hardDeleteThread({ workspaceId, userWorkspaceId, threadId });
  });

  it('persists the authenticated user on ordinary and queued messages', async () => {
    const message = await chat.addMessage({
      workspaceId,
      threadId,
      userWorkspaceId,
      uiMessage: {
        role: AgentMessageRole.USER,
        parts: [{ type: 'text', text: 'Hello' }],
      },
    });
    const queued = await chat.queueMessage({
      workspaceId,
      threadId,
      userWorkspaceId,
      text: 'Next',
    });
    for (const messageId of [message.id, queued.id]) {
      await expect(
        actors.resolveMessage({ workspaceId, threadId, messageId }),
      ).resolves.toMatchObject({
        sender: { userWorkspaceId, applicationId: null },
      });
    }
    const response = await makeMetadataApiRequest({
      query: parse(
        `query($threadId: UUID!) { chatMessages(threadId: $threadId) { id senderUserWorkspaceId } }`,
      ),
      variables: { threadId },
    });
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.chatMessages).toEqual(
      expect.arrayContaining([
        { id: message.id, senderUserWorkspaceId: userWorkspaceId },
        { id: queued.id, senderUserWorkspaceId: userWorkspaceId },
      ]),
    );
    await expect(
      actors.authorizeJob({
        workspaceId,
        threadId,
        messageId: message.id,
        turnId: message.turnId!,
        userWorkspaceId,
      }),
    ).resolves.toMatchObject({ sender: { userWorkspaceId } });
    await expect(
      actors.authorizeJob({
        workspaceId,
        threadId,
        messageId: message.id,
        userWorkspaceId: otherUserWorkspaceId,
      }),
    ).rejects.toBeDefined();
    await chat.deleteQueuedMessage({ workspaceId, messageId: queued.id });
  });

  it('retains the queued sender through promotion and rejects a different executor', async () => {
    const queued = await chat.queueMessage({
      workspaceId,
      threadId,
      userWorkspaceId,
      text: 'Next attributed message',
    });
    const turnId = await chat.promoteQueuedMessage({
      workspaceId,
      threadId,
      messageId: queued.id,
    });
    await expect(
      actors.authorizeJob({
        workspaceId,
        threadId,
        messageId: queued.id,
        turnId: turnId!,
        userWorkspaceId,
      }),
    ).resolves.toMatchObject({ sender: { userWorkspaceId } });
    await expect(
      actors.authorizeJob({
        workspaceId,
        threadId,
        messageId: queued.id,
        userWorkspaceId: otherUserWorkspaceId,
      }),
    ).rejects.toBeDefined();
  });

  it('backfills legacy authors without replacing explicit senders on retries or rollback', async () => {
    const legacy = await chat.addMessage({
      workspaceId,
      threadId,
      uiMessage: {
        role: AgentMessageRole.USER,
        parts: [{ type: 'text', text: 'Legacy' }],
      },
    });
    const explicit = await chat.addMessage({
      workspaceId,
      threadId,
      userWorkspaceId: otherUserWorkspaceId,
      uiMessage: {
        role: AgentMessageRole.USER,
        parts: [{ type: 'text', text: 'Attributed' }],
      },
    });
    const command =
      getAppProviderByClassName<AttributeChatMessageSendersCommand>(
        'AttributeChatMessageSendersCommand',
      );
    const dataSource =
      getCoreRepository<UserWorkspaceEntity>(UserWorkspaceEntity).manager
        .connection;
    const args = { workspaceId, dataSource, index: 0, total: 1, options: {} };
    await expect(
      actors.authorizeJob({
        workspaceId,
        threadId,
        turnId: legacy.turnId!,
        userWorkspaceId,
      }),
    ).resolves.toMatchObject({
      sender: { userWorkspaceId, applicationId: null },
    });
    await command.up(args);
    await command.up(args);
    await command.down(args);
    const storage = getAppProviderByClassName<AgentHistoryStorageService>(
      'AgentHistoryStorageService',
    );
    const records = await storage.run(workspaceId, ({ manager, table }) =>
      manager.query(
        `SELECT id, "senderUserWorkspaceId" FROM ${table('agentMessage')} WHERE id = ANY($1::uuid[])`,
        [[legacy.id, explicit.id]],
      ),
    );
    expect(records).toEqual(
      expect.arrayContaining([
        { id: legacy.id, senderUserWorkspaceId: userWorkspaceId },
        { id: explicit.id, senderUserWorkspaceId: otherUserWorkspaceId },
      ]),
    );
  });
  it('retains explicit core sender and application identities through rollback and re-upgrade', async () => {
    const dataSource =
      getCoreRepository<UserWorkspaceEntity>(UserWorkspaceEntity).manager
        .connection;
    const runner = dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const legacyThreadId = randomUUID();
      const legacyMessageId = randomUUID();
      const applicationId = randomUUID();
      await runner.query(
        'INSERT INTO core."agentChatThread" (id, "workspaceId", "userWorkspaceId") VALUES ($1, $2, $3)',
        [legacyThreadId, workspaceId, userWorkspaceId],
      );
      await runner.query(
        'INSERT INTO core."agentMessage" (id, "workspaceId", "threadId", role, "senderUserWorkspaceId", "senderApplicationId") VALUES ($1, $2, $3, $4, $5, $6)',
        [
          legacyMessageId,
          workspaceId,
          legacyThreadId,
          'user',
          otherUserWorkspaceId,
          applicationId,
        ],
      );
      const command = new AddChatMessageSenderFastInstanceCommand();
      await command.down(runner);
      await command.up(runner);
      const rows = await runner.query(
        'SELECT "senderUserWorkspaceId", "senderApplicationId" FROM core."agentMessage" WHERE id = $1',
        [legacyMessageId],
      );
      expect(rows).toEqual([
        {
          senderUserWorkspaceId: otherUserWorkspaceId,
          senderApplicationId: applicationId,
        },
      ]);
    } finally {
      await runner.rollbackTransaction();
      await runner.release();
    }
  });
});
