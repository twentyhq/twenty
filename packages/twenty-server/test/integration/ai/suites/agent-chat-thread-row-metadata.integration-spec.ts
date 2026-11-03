import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { randomUUID } from 'node:crypto';
import gql from 'graphql-tag';

import { createChatParticipationTestContext } from 'test/integration/ai/utils/create-chat-participation-test-context.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { NO_REPLY_TOOL_NAME } from 'twenty-shared/ai';
import { FeatureFlagKey, FieldActorSource } from 'twenty-shared/types';

import { type AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';

const QUERY = gql`
  query InboxRowMetadata($threadIds: [UUID!]!) {
    agentChatThreadRowMetadata(threadIds: $threadIds) {
      threadId
      activityAt
      messageId
      previewText
      senderType
      senderId
      senderName
      executionOutcome
    }
  }
`;

describe('Inbox row metadata', () => {
  let context: Awaited<ReturnType<typeof createChatParticipationTestContext>>;
  let writer: AgentConversationWriterService;
  let recorder: AgentTurnRecorderService;

  beforeEach(async () => {
    context = await createChatParticipationTestContext();
    writer = getAppProviderByClassName<AgentConversationWriterService>(
      'AgentConversationWriterService',
    );
    recorder = getAppProviderByClassName<AgentTurnRecorderService>(
      'AgentTurnRecorderService',
    );
  });

  afterEach(async () => {
    await context.cleanup();
  });

  const readMetadata = async ({
    threadIds,
    token,
  }: {
    threadIds: string[];
    token?: string;
  }) => {
    const response = await makeGraphqlApiRequest(
      { query: QUERY, variables: { threadIds } },
      token,
    );
    expect(response.body.errors).toBeUndefined();
    return response.body.data.agentChatThreadRowMetadata;
  };

  it('filters inaccessible and missing conversations before projecting their history', async () => {
    const wasPrivateRecordEnabled =
      await context.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_PRIVATE_RECORD_ENABLED,
        context.workspaceId,
      );
    try {
      await context.featureFlagService.upsertWorkspaceFeatureFlag({
        workspaceId: context.workspaceId,
        featureFlag: FeatureFlagKey.IS_PRIVATE_RECORD_ENABLED,
        value: true,
      });
      const threadId = await context.createThread();
      await context.saveMessage({ threadId });
      expect(
        await readMetadata({
          threadIds: [threadId, randomUUID()],
          token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        }),
      ).toEqual([]);
      expect(
        await readMetadata({ threadIds: [threadId, randomUUID()] }),
      ).toHaveLength(1);
    } finally {
      await context.featureFlagService.upsertWorkspaceFeatureFlag({
        workspaceId: context.workspaceId,
        featureFlag: FeatureFlagKey.IS_PRIVATE_RECORD_ENABLED,
        value: wasPrivateRecordEnabled,
      });
    }
  });

  it('pairs the preview and sender despite app-clock skew and any number of silent replies', async () => {
    const threadId = await context.createThread();
    const message = await context.saveMessage({ threadId });
    await global.testDataSource
      .createQueryBuilder()
      .update(`${context.schema}.agentMessage`)
      .set({ processedAt: new Date(Date.now() + 60_000) })
      .where('id = :messageId', { messageId: message.id })
      .execute();
    await context.threadService.recordThreadActivity({
      workspaceId: context.workspaceId,
      threadId,
      text: 'An unrelated cached preview',
    });
    const turnId = await writer.insertTurn({
      workspaceId: context.workspaceId,
      threadId,
      agentId: null,
      status: AgentTurnStatus.RUNNING,
    });
    await recorder.markRunning({
      workspaceId: context.workspaceId,
      turnId,
      modelId: 'test-model',
    });
    for (let index = 0; index < 12; index++) {
      await writer.insertMessage({
        workspaceId: context.workspaceId,
        threadId,
        turnId,
        role: AgentMessageRole.ASSISTANT,
        agentId: null,
        senderUserWorkspaceId: null,
        parts: [
          {
            type: `tool-${NO_REPLY_TOOL_NAME}`,
            toolCallId: randomUUID(),
            state: 'output-available',
            input: {},
            output: { success: true },
          },
        ],
      });
    }
    await writer.insertMessage({
      workspaceId: context.workspaceId,
      threadId,
      turnId,
      role: AgentMessageRole.SYSTEM,
      agentId: null,
      senderUserWorkspaceId: null,
      parts: [{ type: 'text', text: 'Private model context' }],
    });
    await recorder.finish({
      workspaceId: context.workspaceId,
      turnId,
      modelId: 'test-model',
      status: AgentTurnStatus.COMPLETED,
    });
    expect(await readMetadata({ threadIds: [threadId] })).toEqual([
      expect.objectContaining({
        messageId: message.id,
        previewText: 'Hello',
        senderType: 'member',
        senderId: context.workspaceMemberId,
        executionOutcome: null,
      }),
    ]);
  });

  it('reports persisted completion and recovery failure without changing filing or activity', async () => {
    const threadId = await context.createThread();
    const turnId = await writer.insertTurn({
      workspaceId: context.workspaceId,
      threadId,
      agentId: null,
      status: AgentTurnStatus.RUNNING,
    });
    await recorder.markRunning({
      workspaceId: context.workspaceId,
      turnId,
      modelId: 'test-model',
    });
    await writer.upsertAssistantMessage({
      workspaceId: context.workspaceId,
      threadId,
      turnId,
      id: randomUUID(),
      parts: [{ type: 'text', text: 'Review finished' }],
    });
    await context.threadService.recordThreadActivity({
      workspaceId: context.workspaceId,
      threadId,
      text: 'Review finished',
    });
    const before = await context.readThread(threadId);
    await recorder.finish({
      workspaceId: context.workspaceId,
      turnId,
      modelId: 'test-model',
      status: AgentTurnStatus.COMPLETED,
    });
    expect(await readMetadata({ threadIds: [threadId] })).toEqual([
      expect.objectContaining({
        senderType: 'assistant',
        previewText: 'Review finished',
        executionOutcome: 'finished',
      }),
    ]);
    const streamId = randomUUID();
    await recorder.markRunning({
      workspaceId: context.workspaceId,
      turnId,
      modelId: 'test-model',
    });
    await global.testDataSource
      .createQueryBuilder()
      .update(`${context.schema}.agentChatThread`)
      .set({ activeStreamId: streamId })
      .where('id = :threadId', { threadId })
      .execute();
    const recordEvents = jest.spyOn(
      getAppProviderByClassName<WorkspaceEventEmitter>('WorkspaceEventEmitter'),
      'emitDatabaseBatchEvent',
    );
    try {
      await recorder.releaseStreamClaim({
        workspaceId: context.workspaceId,
        threadId,
        streamId,
        endRunningTurn: {
          status: AgentTurnStatus.FAILED,
          error: { code: 'INTERRUPTED', message: 'Worker stopped' },
        },
      });
      expect(recordEvents).toHaveBeenCalledWith(
        expect.objectContaining({
          objectMetadataNameSingular: 'agentChatThread',
          events: expect.arrayContaining([
            expect.objectContaining({
              recordId: threadId,
              properties: expect.objectContaining({
                updatedFields: expect.arrayContaining(['updatedAt']),
              }),
            }),
          ]),
        }),
      );
    } finally {
      recordEvents.mockRestore();
    }
    expect(await readMetadata({ threadIds: [threadId] })).toEqual([
      expect.objectContaining({ executionOutcome: 'failed' }),
    ]);
    const after = await context.readThread(threadId);
    expect(after.lastActivityAt).toEqual(before.lastActivityAt);
    expect(after.deletedAt).toEqual(before.deletedAt);
  });

  it('records workflow identity when delivering again into an existing legacy conversation', async () => {
    const inbox =
      getAppProviderByClassName<AgentInboxService>('AgentInboxService');
    const sender = {
      type: 'workflow',
      workflowId: randomUUID(),
      workflowName: 'Pipeline digest',
    } as const;
    const input = {
      threadKey: randomUUID(),
      idempotencyKey: randomUUID(),
      title: 'Pipeline digest',
      text: 'Three deals moved to Proposal',
      workspaceMemberIds: [context.workspaceMemberId],
    };
    const delivery = await inbox.sendMessage({
      workspaceId: context.workspaceId,
      sender,
      input,
    });
    context.registerThread(delivery.threadId);
    const first = await readMetadata({ threadIds: [delivery.threadId] });
    expect(first).toEqual([
      expect.objectContaining({
        senderType: 'workflow',
        senderId: sender.workflowId,
        senderName: 'Pipeline digest',
        executionOutcome: null,
      }),
    ]);
    await global.testDataSource
      .createQueryBuilder()
      .update(`${context.schema}.agentTurn`)
      .set({
        createdBySource: FieldActorSource.SYSTEM,
        createdByName: 'System',
        createdByContext: {},
      })
      .where('"threadId" = :threadId', { threadId: delivery.threadId })
      .execute();
    await inbox.sendMessage({
      workspaceId: context.workspaceId,
      sender,
      input: { ...input, idempotencyKey: randomUUID() },
    });
    expect(await readMetadata({ threadIds: [delivery.threadId] })).toEqual([
      expect.objectContaining({
        senderType: 'workflow',
        senderId: sender.workflowId,
        senderName: 'Pipeline digest',
        executionOutcome: null,
      }),
    ]);
  });
});
