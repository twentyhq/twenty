import { AgentChatInboxDeliveryReason } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-delivery-reason.enum';
import { randomUUID } from 'node:crypto';

import { configureChatParticipationModels } from 'test/integration/ai/utils/configure-chat-participation-models.util';
import { createChatParticipationTestContext } from 'test/integration/ai/utils/create-chat-participation-test-context.util';
import { retryChatMessageOperationFactory } from 'test/integration/graphql/utils/retry-chat-message-operation-factory.util';
import { saveDirectMessageAssistantModeOperationFactory } from 'test/integration/graphql/utils/save-direct-message-assistant-mode-operation-factory.util';
import { sendChatParticipationMessage } from 'test/integration/graphql/utils/send-chat-participation-message.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { FeatureFlagKey, RecordShareAccessLevel } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { type AgentChatDirectMessageIdentityService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-direct-message-identity.service';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/is-private-column-name.constant';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('Chat participation through the authenticated API', () => {
  let context: Awaited<ReturnType<typeof createChatParticipationTestContext>>;
  let models: ReturnType<typeof configureChatParticipationModels>;

  beforeEach(async () => {
    context = await createChatParticipationTestContext();
    models = configureChatParticipationModels();
  });

  afterEach(async () => {
    await context.cleanup();
    models.restore();
    jest.restoreAllMocks();
  });

  it('defaults a new direct chat to Ada and starts a reply', async () => {
    const threadId = context.registerThread();
    const response = await sendChatParticipationMessage({ threadId });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.streamId).toEqual(
      expect.any(String),
    );
    expect(await context.readThread(threadId)).toMatchObject({
      isAssistantParticipant: true,
      workspaceMemberId: context.workspaceMemberId,
    });
  });

  const addJonyAsParticipant = (threadId: string) =>
    context.inboxDeliveryService.deliverThreadToMemberInboxes({
      workspaceId: context.workspaceId,
      workspaceMemberId: context.workspaceMemberId,
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
      reason: AgentChatInboxDeliveryReason.RECIPIENT,
    });
  const createDirectMessage = async () =>
    context.registerThread(
      await getAppProviderByClassName<AgentChatDirectMessageIdentityService>(
        'AgentChatDirectMessageIdentityService',
      ).open({
        workspaceId: context.workspaceId,
        firstWorkspaceMemberId: context.workspaceMemberId,
        secondWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      }),
    );

  it.each([
    {
      mode: AiChatAssistantMode.NEVER,
      isAssistantMentioned: true,
      shouldReply: false,
      evaluationCalls: 0,
    },
    {
      mode: AiChatAssistantMode.MENTION_ONLY,
      isAssistantMentioned: false,
      shouldReply: false,
      evaluationCalls: 0,
    },
    {
      mode: AiChatAssistantMode.MENTION_ONLY,
      isAssistantMentioned: true,
      shouldReply: true,
      evaluationCalls: 0,
    },
    {
      mode: AiChatAssistantMode.AUTOMATIC,
      isAssistantMentioned: false,
      shouldReply: true,
      evaluationCalls: 1,
    },
  ])(
    'applies saved DM mode $mode when Ada mention is $isAssistantMentioned',
    async ({ mode, isAssistantMentioned, shouldReply, evaluationCalls }) => {
      models.enableEvaluation();
      const saved = await makeMetadataApiRequest(
        saveDirectMessageAssistantModeOperationFactory(mode),
      );

      expect(saved.body.errors).toBeUndefined();
      expect(
        saved.body.data.updateWorkspace.aiChatDirectMessageAssistantMode,
      ).toBe(mode);

      const threadId = await createDirectMessage();
      const response = await sendChatParticipationMessage({
        threadId,
        isAssistantMentioned,
        isAssistantParticipant: false,
      });

      expect(response.body.errors).toBeUndefined();
      expect(isDefined(response.body.data.sendChatMessage.streamId)).toBe(
        shouldReply,
      );
      expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
        shouldReply,
      );

      if (shouldReply) {
        await waitForAllJobsToFinish();
      }

      expect(models.evaluate).toHaveBeenCalledTimes(evaluationCalls);

      if (!shouldReply) {
        return;
      }

      const assistantRecords = await global.testDataSource
        .createQueryBuilder()
        .select('message.id', 'messageId')
        .addSelect(`message."${IS_PRIVATE_COLUMN_NAME}"`, 'messageIsPrivate')
        .addSelect('part.id', 'partId')
        .addSelect(`part."${IS_PRIVATE_COLUMN_NAME}"`, 'partIsPrivate')
        .from(`${context.schema}.agentMessage`, 'message')
        .leftJoin(
          (queryBuilder) =>
            queryBuilder
              .select('*')
              .from(`${context.schema}.agentMessagePart`, 'messagePart'),
          'part',
          'part."messageId" = message.id',
        )
        .where('message."threadId" = :threadId', { threadId })
        .andWhere('message.role = :role', { role: AgentMessageRole.ASSISTANT })
        .getRawMany<{
          messageId: string;
          messageIsPrivate: boolean;
          partId: string | null;
          partIsPrivate: boolean | null;
        }>();

      expect(assistantRecords).not.toHaveLength(0);

      const recordShares = await global.testDataSource
        .createQueryBuilder()
        .select('share."recordId"', 'recordId')
        .addSelect('share."principalId"', 'principalId')
        .from(`${context.schema}.recordShare`, 'share')
        .where('share."recordId" IN (:...recordIds)', {
          recordIds: assistantRecords
            .flatMap(({ messageId, partId }) => [messageId, partId])
            .filter(isDefined),
        })
        .orderBy('share."principalId"', 'ASC')
        .getRawMany<{ recordId: string; principalId: string }>();

      for (const record of assistantRecords) {
        expect(record.messageIsPrivate).toBe(true);
        expect(record.partIsPrivate).toBe(true);
        for (const recordId of [record.messageId, record.partId]) {
          expect(
            recordShares
              .filter((share) => share.recordId === recordId)
              .map(({ principalId }) => principalId),
          ).toEqual(
            [
              context.workspaceMemberId,
              WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
            ].sort(),
          );
        }
      }
    },
  );

  it('retries a failed direct message assistant turn', async () => {
    const threadId = await createDirectMessage();
    const sent = await sendChatParticipationMessage({
      threadId,
      isAssistantMentioned: true,
    });

    expect(sent.body.errors).toBeUndefined();
    await waitForAllJobsToFinish();

    const { messageId } = sent.body.data.sendChatMessage;

    const message = await global.testDataSource
      .createQueryBuilder()
      .select('message."turnId"', 'turnId')
      .from(`${context.schema}.agentMessage`, 'message')
      .where('message.id = :messageId', { messageId })
      .getRawOne<{ turnId: string }>();

    assertIsDefinedOrThrow(message);
    await global.testDataSource
      .createQueryBuilder()
      .update(`${context.schema}.agentTurn`)
      .set({ status: AgentTurnStatus.FAILED })
      .where('id = :turnId', { turnId: message.turnId })
      .execute();

    const retried = await makeMetadataApiRequest(
      retryChatMessageOperationFactory(threadId),
    );

    expect(retried.body.errors).toBeUndefined();
    expect(retried.body.data.retryChatMessage.streamId).toEqual(
      expect.any(String),
    );
    await waitForAllJobsToFinish();

    const turn = await global.testDataSource
      .createQueryBuilder()
      .select('turn.status', 'status')
      .from(`${context.schema}.agentTurn`, 'turn')
      .where('turn.id = :turnId', { turnId: message.turnId })
      .getRawOne<{ status: AgentTurnStatus }>();

    expect(turn).toEqual({ status: AgentTurnStatus.COMPLETED });
  });

  it('answers an Ada-only chat despite both Never settings and client opt-outs', async () => {
    await context.setAssistantModes({
      aiChatDirectMessageAssistantMode: AiChatAssistantMode.NEVER,
      aiChatInboxAssistantMode: AiChatAssistantMode.NEVER,
    });
    const threadId = context.registerThread();
    const response = await sendChatParticipationMessage({
      threadId,
      isAssistantParticipant: false,
      shouldAssistantReply: false,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.streamId).toEqual(
      expect.any(String),
    );
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      true,
    );
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it('delivers valid initial recipients unread without marking them mentioned', async () => {
    const threadId = context.registerThread();
    const recipientId = WORKSPACE_MEMBER_DATA_SEED_IDS.JONY;
    const foreignMemberId = randomUUID();
    const response = await sendChatParticipationMessage({
      threadId,
      isAssistantParticipant: false,
      recipientWorkspaceMemberIds: [
        recipientId,
        recipientId,
        foreignMemberId,
        WORKSPACE_MEMBER_DATA_SEED_IDS.SCOTT,
      ],
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.streamId).toBeNull();
    expect(
      response.body.data.sendChatMessage.recipientParticipantWorkspaceMemberIds,
    ).toEqual([recipientId]);
    const participants = await context.readParticipants(threadId);

    expect(participants).toContainEqual(
      expect.objectContaining({
        workspaceMemberId: recipientId,
        lastReadAt: null,
        archivedAt: null,
        isSubscribed: true,
        lastMentionedAt: null,
      }),
    );
    expect(participants).not.toContainEqual(
      expect.objectContaining({ workspaceMemberId: foreignMemberId }),
    );
    expect(participants).not.toContainEqual(
      expect.objectContaining({
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.SCOTT,
      }),
    );
  });

  it.each([
    {
      threadState: 'new',
      hasExistingThread: false,
      isRecordSharingEnabled: true,
      recipientWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.SCOTT,
    },
    {
      threadState: 'pre-created empty',
      hasExistingThread: true,
      isRecordSharingEnabled: true,
      recipientWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.SCOTT,
    },
    {
      threadState: 'new with record sharing disabled',
      hasExistingThread: false,
      isRecordSharingEnabled: false,
      recipientWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    },
  ])(
    'refuses a first send without Ada in a $threadState thread when no picked person can reply',
    async ({
      hasExistingThread,
      isRecordSharingEnabled,
      recipientWorkspaceMemberId,
    }) => {
      await context.featureFlagService.upsertWorkspaceFeatureFlag({
        workspaceId: context.workspaceId,
        featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
        value: isRecordSharingEnabled,
      });
      const threadId = hasExistingThread
        ? await context.createThread()
        : context.registerThread();
      const threadBefore = await context.readThread(threadId);
      const emitter = getAppProviderByClassName<WorkspaceEventEmitter>(
        'WorkspaceEventEmitter',
      );
      const emit = jest.spyOn(emitter, 'emitDatabaseBatchEvent');
      const response = await sendChatParticipationMessage({
        threadId,
        isAssistantParticipant: false,
        recipientWorkspaceMemberIds: [recipientWorkspaceMemberId],
      });

      expect(response.body.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        subCode: 'CHAT_RECIPIENTS_CANNOT_REPLY',
        userFriendlyMessage: expect.stringContaining(
          'None of the people you picked can reply',
        ),
      });
      expect(await context.readThread(threadId)).toEqual(threadBefore);
      expect(
        await context.chatService.hasMessages({
          workspaceId: context.workspaceId,
          threadId,
        }),
      ).toBe(false);
      const hasCreatedThreadEvent = emit.mock.calls.some(
        ([event]) =>
          isDefined(event) &&
          event.objectMetadataNameSingular === 'agentChatThread' &&
          event.action === DatabaseEventAction.CREATED &&
          event.events.some(({ recordId }) => recordId === threadId),
      );

      expect(hasCreatedThreadEvent).toBe(false);

      if (isRecordSharingEnabled) {
        return;
      }

      const retried = await sendChatParticipationMessage({
        threadId,
        isAssistantParticipant: true,
        recipientWorkspaceMemberIds: [recipientWorkspaceMemberId],
      });

      expect(retried.body.errors).toBeUndefined();
      expect(retried.body.data.sendChatMessage.streamId).toEqual(
        expect.any(String),
      );
      expect(
        retried.body.data.sendChatMessage
          .recipientParticipantWorkspaceMemberIds,
      ).toEqual([]);
      expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
        true,
      );
    },
  );

  it('delivers a member selected and mentioned once while acknowledging both selections', async () => {
    const threadId = await context.createThread(false);
    const workspaceMemberId = WORKSPACE_MEMBER_DATA_SEED_IDS.JONY;
    const emitter = getAppProviderByClassName<WorkspaceEventEmitter>(
      'WorkspaceEventEmitter',
    );
    const emit = jest.spyOn(emitter, 'emitDatabaseBatchEvent');
    const response = await sendChatParticipationMessage({
      threadId,
      isAssistantParticipant: false,
      shouldAssistantReply: false,
      mentionedWorkspaceMemberIds: [workspaceMemberId],
      recipientWorkspaceMemberIds: [workspaceMemberId],
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage).toMatchObject({
      mentionedParticipantWorkspaceMemberIds: [workspaceMemberId],
      recipientParticipantWorkspaceMemberIds: [workspaceMemberId],
    });
    const participant = await global.testDataSource
      .createQueryBuilder()
      .select('participant.id', 'id')
      .from(`${context.schema}.agentChatThreadParticipant`, 'participant')
      .where('participant."threadId" = :threadId', { threadId })
      .andWhere('participant."workspaceMemberId" = :workspaceMemberId', {
        workspaceMemberId,
      })
      .getRawOne<{ id: string }>();

    assertIsDefinedOrThrow(participant);
    const actions = emit.mock.calls
      .filter(
        ([event]) =>
          isDefined(event) &&
          event.objectMetadataNameSingular === 'agentChatThreadParticipant' &&
          event.events.some(({ recordId }) => recordId === participant.id),
      )
      .map(([event]) => event?.action);

    expect(actions).toEqual([DatabaseEventAction.CREATED]);
    expect(await context.readParticipants(threadId)).toContainEqual(
      expect.objectContaining({
        workspaceMemberId,
        lastReadAt: null,
        isSubscribed: true,
        lastMentionedAt: expect.anything(),
      }),
    );
  });

  it('does not turn a direct chat into a group for an invalid mentioned member', async () => {
    const threadId = context.registerThread();
    const response = await sendChatParticipationMessage({
      threadId,
      mentionedWorkspaceMemberIds: [randomUUID()],
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.streamId).toEqual(
      expect.any(String),
    );
    expect(
      response.body.data.sendChatMessage.mentionedParticipantWorkspaceMemberIds,
    ).toEqual([]);
  });

  it('refuses a read-only sender without changing ownership or adding a message', async () => {
    const threadId = await context.createThread(false);

    await context.share({
      threadId,
      recipientWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      accessLevel: RecordShareAccessLevel.READ,
    });
    const response = await sendChatParticipationMessage({
      threadId,
      isAssistantMentioned: true,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors).toBeDefined();
    expect(await context.readThread(threadId)).toMatchObject({
      isAssistantParticipant: false,
      workspaceMemberId: context.workspaceMemberId,
    });
    expect(
      await context.chatService.hasMessages({
        workspaceId: context.workspaceId,
        threadId,
      }),
    ).toBe(false);
  });

  it('excludes read-only recipients when the sender cannot grant them access', async () => {
    const threadId = await context.createThread(false);
    const senderId = WORKSPACE_MEMBER_DATA_SEED_IDS.JONY;
    const recipientId = WORKSPACE_MEMBER_DATA_SEED_IDS.TIM;

    await context.share({
      threadId,
      recipientWorkspaceMemberId: senderId,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
    });
    await context.share({
      threadId,
      recipientWorkspaceMemberId: recipientId,
      accessLevel: RecordShareAccessLevel.READ,
    });

    expect(
      await context.sharingService.findEligibleParticipantWorkspaceMemberIds({
        workspaceId: context.workspaceId,
        workspaceMemberId: senderId,
        threadId,
        memberIds: [recipientId, randomUUID()],
      }),
    ).toEqual([]);

    const response = await sendChatParticipationMessage({
      threadId,
      isAssistantParticipant: false,
      recipientWorkspaceMemberIds: [recipientId],
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.sendChatMessage.recipientParticipantWorkspaceMemberIds,
    ).toEqual([]);
    expect(await context.readParticipants(threadId)).not.toContainEqual(
      expect.objectContaining({ workspaceMemberId: recipientId }),
    );
  });

  it('allows revised initial choices after a failed send leaves an empty thread', async () => {
    const threadId = context.registerThread();
    const failed = await sendChatParticipationMessage({
      threadId,
      modelId: 'missing-provider/missing-model',
      isAssistantParticipant: true,
    });

    expect(failed.body.errors).toBeDefined();
    expect(
      await context.chatService.hasMessages({
        workspaceId: context.workspaceId,
        threadId,
      }),
    ).toBe(false);

    const retried = await sendChatParticipationMessage({
      threadId,
      isAssistantParticipant: false,
      recipientWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });

    expect(retried.body.errors).toBeUndefined();
    expect(retried.body.data.sendChatMessage.streamId).toBeNull();
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      false,
    );
  });

  it('keeps Ada excluded for a cached client that omits the mention signal', async () => {
    const threadId = await context.createThread(false);

    await addJonyAsParticipant(threadId);
    await context.saveMessage({ threadId });
    const response = await sendChatParticipationMessage({
      threadId,
      isAssistantMentioned: null,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.streamId).toBeNull();
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      false,
    );
  });

  it('does not bypass mention-only mode when a cached client omits the mention signal', async () => {
    models.enableEvaluation();
    await context.setAssistantModes({
      aiChatInboxAssistantMode: AiChatAssistantMode.MENTION_ONLY,
    });
    const threadId = await context.createThread();

    await addJonyAsParticipant(threadId);
    const response = await sendChatParticipationMessage({
      threadId,
      isAssistantMentioned: null,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.streamId).toBeNull();
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it('preserves assistant execution outside the inbox when the client disables replies', async () => {
    await context.featureFlagService.upsertWorkspaceFeatureFlag({
      workspaceId: context.workspaceId,
      featureFlag: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
      value: false,
    });
    const threadId = context.registerThread();
    const response = await sendChatParticipationMessage({
      threadId,
      shouldAssistantReply: false,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.streamId).toEqual(
      expect.any(String),
    );
  });
});
