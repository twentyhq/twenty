import { randomUUID } from 'node:crypto';

import { configureChatParticipationModels } from 'test/integration/ai/utils/configure-chat-participation-models.util';
import { createChatParticipationTestContext } from 'test/integration/ai/utils/create-chat-participation-test-context.util';
import { runWithRejectedChatWrite } from 'test/integration/ai/utils/run-with-rejected-chat-write.util';
import { sendChatParticipationMessage } from 'test/integration/graphql/utils/send-chat-participation-message.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { FeatureFlagKey, RecordShareAccessLevel } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { AgentChatInboxAction } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-action.enum';
import { type AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { type AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { type AgentChatThreadParticipantRow } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-row.type';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { type AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('Chat message participation with real storage', () => {
  let context: Awaited<ReturnType<typeof createChatParticipationTestContext>>;

  beforeEach(async () => {
    context = await createChatParticipationTestContext();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    if (isDefined(context)) {
      await context.cleanup();
    }
  });

  it.each([true, false])(
    'rolls back the Ada selection and turn when storing the message fails with inbox enabled %s',
    async (isInboxEnabled) => {
      configureChatParticipationModels();
      await context.featureFlagService.upsertWorkspaceFeatureFlag({
        workspaceId: context.workspaceId,
        featureFlag: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
        value: isInboxEnabled,
      });
      const threadId = await context.createThread(false);
      const messageId = randomUUID();

      const response = await runWithRejectedChatWrite({
        workspaceId: context.workspaceId,
        threadId,
        operation: 'message',
        work: async () =>
          sendChatParticipationMessage({
            threadId,
            messageId,
            isAssistantMentioned: true,
            shouldAssistantReply: false,
            recipientWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
          }),
      });

      expect(response.body.errors).toBeDefined();
      expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
        false,
      );
      expect(
        await global.testDataSource.query(
          `SELECT id FROM "${context.schema}"."agentMessage" WHERE "threadId" = $1`,
          [threadId],
        ),
      ).toEqual([]);
      expect(
        await global.testDataSource.query(
          `SELECT id FROM "${context.schema}"."agentTurn" WHERE "threadId" = $1`,
          [threadId],
        ),
      ).toEqual([]);
      expect(await context.readParticipants(threadId)).toEqual([
        expect.objectContaining({
          workspaceMemberId: context.workspaceMemberId,
        }),
      ]);
    },
  );

  it('keeps Ada participation unchanged when a legacy chat send fails preflight', async () => {
    const threadId = await context.createThread(false);

    await context.featureFlagService.upsertWorkspaceFeatureFlag({
      workspaceId: context.workspaceId,
      featureFlag: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
      value: false,
    });
    const modelRegistry = getAppProviderByClassName<AiModelRegistryService>(
      'AiModelRegistryService',
    );

    jest.spyOn(modelRegistry, 'getAvailableModels').mockReturnValue([]);

    const response = await sendChatParticipationMessage({
      threadId,
      isAssistantMentioned: true,
    });

    expect(response.body.errors).toBeDefined();
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      false,
    );
    expect(
      await context.chatService.hasMessages({
        workspaceId: context.workspaceId,
        threadId,
      }),
    ).toBe(false);
  });

  it('keeps the accepted message and Ada selection when initial recipient delivery fails', async () => {
    const threadId = await context.createThread();
    const messageId = randomUUID();
    const response = await runWithRejectedChatWrite({
      workspaceId: context.workspaceId,
      threadId,
      operation: 'share',
      work: async () =>
        sendChatParticipationMessage({
          threadId,
          messageId,
          isAssistantParticipant: false,
          shouldAssistantReply: false,
          recipientWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
        }),
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage).toMatchObject({
      messageId,
      queued: false,
      recipientParticipantWorkspaceMemberIds: [],
    });
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      false,
    );
    expect(
      await context.chatService.getMessagesForThread({
        workspaceId: context.workspaceId,
        workspaceMemberId: context.workspaceMemberId,
        threadId,
      }),
    ).toContainEqual(expect.objectContaining({ id: messageId }));
    expect(await context.readParticipants(threadId)).not.toContainEqual(
      expect.objectContaining({
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      }),
    );
  });

  it('replays a first message stored before its send failed with the revised choices', async () => {
    configureChatParticipationModels();
    const threadId = context.registerThread();
    const messageId = randomUUID();
    const streamingService =
      getAppProviderByClassName<AgentChatStreamingService>(
        'AgentChatStreamingService',
      );

    jest
      .spyOn(streamingService, 'enqueueStreamJob')
      .mockRejectedValueOnce(new Error('Queue unavailable'));

    const failed = await sendChatParticipationMessage({ threadId, messageId });

    expect(failed.body.errors).toBeDefined();

    const retried = await sendChatParticipationMessage({
      threadId,
      messageId,
      isAssistantParticipant: false,
      recipientWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });

    expect(retried.body.errors).toBeUndefined();
    expect(retried.body.data.sendChatMessage).toMatchObject({
      messageId,
      queued: false,
      streamId: null,
      recipientParticipantWorkspaceMemberIds: [
        WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      ],
    });
    expect(
      await context.chatService.getMessagesForThread({
        workspaceId: context.workspaceId,
        workspaceMemberId: context.workspaceMemberId,
        threadId,
      }),
    ).toEqual([expect.objectContaining({ id: messageId })]);
    expect(
      await global.testDataSource.query(
        `SELECT id FROM "${context.schema}"."agentTurn" WHERE "threadId" = $1`,
        [threadId],
      ),
    ).toHaveLength(1);
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      false,
    );
    expect(await context.readParticipants(threadId)).toContainEqual(
      expect.objectContaining({
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      }),
    );
  });

  it("restarts Ada's failed reply when a stored first message is sent again", async () => {
    configureChatParticipationModels();
    const threadId = context.registerThread();
    const messageId = randomUUID();
    const streamingService =
      getAppProviderByClassName<AgentChatStreamingService>(
        'AgentChatStreamingService',
      );

    jest
      .spyOn(streamingService, 'enqueueStreamJob')
      .mockRejectedValueOnce(new Error('Queue unavailable'));

    const failed = await sendChatParticipationMessage({ threadId, messageId });

    expect(failed.body.errors).toBeDefined();

    const retried = await sendChatParticipationMessage({ threadId, messageId });

    expect(retried.body.errors).toBeUndefined();
    expect(retried.body.data.sendChatMessage).toMatchObject({
      messageId,
      queued: false,
      streamId: expect.any(String),
    });
    await waitForAllJobsToFinish();
    expect(
      await context.chatService.getMessagesForThread({
        workspaceId: context.workspaceId,
        workspaceMemberId: context.workspaceMemberId,
        threadId,
      }),
    ).toEqual([
      expect.objectContaining({ id: messageId }),
      expect.objectContaining({ role: AgentMessageRole.ASSISTANT }),
    ]);
  });

  it('returns a stored first message sent again after a later message without revising its choices', async () => {
    configureChatParticipationModels();
    const threadId = context.registerThread();
    const messageId = randomUUID();
    const streamingService =
      getAppProviderByClassName<AgentChatStreamingService>(
        'AgentChatStreamingService',
      );

    jest
      .spyOn(streamingService, 'enqueueStreamJob')
      .mockRejectedValueOnce(new Error('Queue unavailable'));

    const failed = await sendChatParticipationMessage({ threadId, messageId });

    expect(failed.body.errors).toBeDefined();

    await context.saveMessage({ threadId });

    const retried = await sendChatParticipationMessage({
      threadId,
      messageId,
      isAssistantParticipant: false,
    });

    expect(retried.body.errors).toBeUndefined();
    expect(retried.body.data.sendChatMessage).toMatchObject({
      messageId,
      queued: false,
      streamId: null,
    });
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      true,
    );
  });

  it('delivers valid initial recipients when sharing with a mentioned member fails', async () => {
    const threadId = await context.createThread();
    const messageId = randomUUID();
    const response = await runWithRejectedChatWrite({
      workspaceId: context.workspaceId,
      threadId,
      operation: 'share',
      principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      work: async () =>
        sendChatParticipationMessage({
          threadId,
          messageId,
          isAssistantParticipant: false,
          shouldAssistantReply: false,
          mentionedWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
          recipientWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.TIM],
        }),
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage).toMatchObject({
      messageId,
      queued: false,
      mentionedParticipantWorkspaceMemberIds: [],
      recipientParticipantWorkspaceMemberIds: [
        WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      ],
    });
    expect(
      await context.chatService.getMessagesForThread({
        workspaceId: context.workspaceId,
        workspaceMemberId: context.workspaceMemberId,
        threadId,
      }),
    ).toContainEqual(expect.objectContaining({ id: messageId }));
    const participants = await context.readParticipants(threadId);

    expect(participants).toContainEqual(
      expect.objectContaining({
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
        lastReadAt: null,
        lastMentionedAt: null,
        isSubscribed: true,
      }),
    );
    expect(participants).not.toContainEqual(
      expect.objectContaining({
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      }),
    );
  });

  it('mentions a participant created by an earlier inbox action', async () => {
    const threadId = await context.createThread();
    const participantService =
      getAppProviderByClassName<AgentChatThreadParticipantService>(
        'AgentChatThreadParticipantService',
      );
    const emitter = getAppProviderByClassName<WorkspaceEventEmitter>(
      'WorkspaceEventEmitter',
    );
    const recipientWorkspaceMemberId = WORKSPACE_MEMBER_DATA_SEED_IDS.JONY;

    for (const workspaceMemberId of [
      recipientWorkspaceMemberId,
      WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    ]) {
      await context.share({
        threadId,
        recipientWorkspaceMemberId: workspaceMemberId,
        accessLevel: RecordShareAccessLevel.READ_WRITE,
      });
    }

    const emit = jest.spyOn(emitter, 'emitDatabaseBatchEvent');
    const [archivedParticipant] = await participantService.updateInboxState({
      workspaceId: context.workspaceId,
      workspaceMemberId: recipientWorkspaceMemberId,
      threadIds: [threadId],
      action: AgentChatInboxAction.ARCHIVE,
      snoozedUntil: null,
    });

    assertIsDefinedOrThrow(archivedParticipant);

    const response = await sendChatParticipationMessage({
      threadId,
      shouldAssistantReply: false,
      mentionedWorkspaceMemberIds: [
        recipientWorkspaceMemberId,
        WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      ],
    });

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.sendChatMessage.mentionedParticipantWorkspaceMemberIds,
    ).toEqual([recipientWorkspaceMemberId, WORKSPACE_MEMBER_DATA_SEED_IDS.TIM]);

    const participants = await global.testDataSource.query<
      AgentChatThreadParticipantRow[]
    >(
      `SELECT * FROM "${context.schema}"."agentChatThreadParticipant" WHERE "threadId" = $1`,
      [threadId],
    );

    for (const workspaceMemberId of [
      recipientWorkspaceMemberId,
      WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    ]) {
      const participant = participants.find(
        (row) => row.workspaceMemberId === workspaceMemberId,
      );

      expect(participant).toMatchObject({
        lastReadAt: null,
        archivedAt: null,
        isSubscribed: true,
        lastMentionedAt: expect.anything(),
      });
      assertIsDefinedOrThrow(participant);

      const actions = emit.mock.calls
        .filter(
          ([event]) =>
            isDefined(event) &&
            event.objectMetadataNameSingular === 'agentChatThreadParticipant' &&
            event.events.some(({ recordId }) => recordId === participant.id),
        )
        .map(([event]) => event?.action);

      expect(actions).toEqual(
        participant.id === archivedParticipant.id
          ? [DatabaseEventAction.CREATED, DatabaseEventAction.UPDATED]
          : [DatabaseEventAction.CREATED],
      );
    }
  });

  it('applies Never on a later accepted message without removing earlier messages', async () => {
    const threadId = await context.createThread(false);
    const firstMessageId = randomUUID();
    const secondMessageId = randomUUID();

    const firstResponse = await sendChatParticipationMessage({
      threadId,
      messageId: firstMessageId,
      isAssistantMentioned: true,
      shouldAssistantReply: false,
      recipientWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });

    expect(firstResponse.body.errors).toBeUndefined();
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      true,
    );
    await context.setAssistantModes({
      aiChatInboxAssistantMode: AiChatAssistantMode.NEVER,
    });
    const secondResponse = await sendChatParticipationMessage({
      threadId,
      messageId: secondMessageId,
      isAssistantMentioned: true,
      shouldAssistantReply: false,
    });

    expect(secondResponse.body.errors).toBeUndefined();
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      false,
    );
    expect(
      await global.testDataSource.query(
        `SELECT id FROM "${context.schema}"."agentMessage" WHERE "threadId" = $1`,
        [threadId],
      ),
    ).toEqual(
      expect.arrayContaining([{ id: firstMessageId }, { id: secondMessageId }]),
    );
  });
});
