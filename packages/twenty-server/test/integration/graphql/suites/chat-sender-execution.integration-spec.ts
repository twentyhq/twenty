import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { AddChatMessageSenderFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-instance-command-fast-1790171503074-add-chat-message-sender';
import { DropCoreAgentHistoryTablesFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-instance-command-fast-1791094130961-drop-core-agent-history-tables';
import { randomUUID } from 'node:crypto';
import { parse } from 'graphql';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { type AgentChatQueueService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-queue.service';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { type AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const getAgentChatThreadService = () =>
  getAppProviderByClassName<AgentChatThreadService>('AgentChatThreadService');

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const workspaceMemberId = WORKSPACE_MEMBER_DATA_SEED_IDS.JANE;
const userWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.JANE;
const otherUserWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.JONY;

describe('Persisted chat senders', () => {
  let chat: AgentChatService;
  let queue: AgentChatQueueService;
  let actors: AgentChatActorService;
  const threadId = randomUUID();
  beforeAll(async () => {
    chat = getAppProviderByClassName<AgentChatService>('AgentChatService');
    queue = getAppProviderByClassName<AgentChatQueueService>(
      'AgentChatQueueService',
    );
    actors = getAppProviderByClassName<AgentChatActorService>(
      'AgentChatActorService',
    );
    await getAgentChatThreadService().createThread({
      workspaceId,
      workspaceMemberId,
      id: threadId,
      title: 'Sender regression',
    });
  });
  afterAll(async () => {
    await destroyAgentChatThread({ threadId });
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
    const queued = await queue.queueMessage({
      workspaceId,
      threadId,
      userWorkspaceId,
      workspaceMemberId,
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
        `query($threadId: UUID!) { chatMessages(threadId: $threadId) { id senderWorkspaceMemberId } }`,
      ),
      variables: { threadId },
    });
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.chatMessages).toEqual(
      expect.arrayContaining([
        { id: message.id, senderWorkspaceMemberId: workspaceMemberId },
        { id: queued.id, senderWorkspaceMemberId: workspaceMemberId },
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
    await queue.deleteQueuedMessage({ workspaceId, messageId: queued.id });
  });

  it('retains the queued sender through promotion and rejects a different executor', async () => {
    const queued = await queue.queueMessage({
      workspaceId,
      threadId,
      userWorkspaceId,
      workspaceMemberId,
      text: 'Next attributed message',
    });
    const turnId = await queue.promoteQueuedMessage({
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

  it('retains explicit core sender and application identities through rollback and re-upgrade', async () => {
    const dataSource =
      getCoreRepository<UserWorkspaceEntity>(UserWorkspaceEntity).manager
        .connection;
    const runner = dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      await new DropCoreAgentHistoryTablesFastInstanceCommand().down(runner);
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
