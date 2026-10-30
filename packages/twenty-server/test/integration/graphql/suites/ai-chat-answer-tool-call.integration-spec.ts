import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import { buildFallbackProposedToolCall } from 'twenty-shared/ai';
import { answerToolCall } from 'test/integration/graphql/suites/workflow/utils/answer-tool-call.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { buildProposeToolCallPendingOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/propose-tool-call.pausing-tool';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { type AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { type AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { type AgentChatThreadWriteStep } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-write-step.type';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { type AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { createAskQuestionTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/ask-question.tool';
import { type AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const getAgentChatThreadService = () =>
  getAppProviderByClassName<AgentChatThreadService>('AgentChatThreadService');

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const schema = getWorkspaceSchemaName(workspaceId);
const workspaceMemberId = WORKSPACE_MEMBER_DATA_SEED_IDS.JANE;
const userWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.JANE;

const QUESTION = {
  header: 'Plan',
  question: 'Which plan should I quote?',
  options: [{ label: 'Pro' }, { label: 'Team' }],
};

const PROPOSAL_INPUT = {
  toolName: 'create_company',
  arguments: { name: 'Acme' },
  summary: 'Create Acme',
};

describe('Answering a chat tool call', () => {
  const threadId = randomUUID();
  let chat: AgentChatService;
  let enqueueStream: jest.SpyInstance;
  const spies: jest.SpyInstance[] = [];
  const testSpies: jest.SpyInstance[] = [];

  const pauseOnQuestions = async (...toolCallIds: string[]) => {
    const userMessage = await chat.addMessage({
      workspaceId,
      threadId,
      userWorkspaceId,
      uiMessage: {
        role: AgentMessageRole.USER,
        parts: [{ type: 'text', text: 'Draft a quote' }],
      },
    });

    const assistantMessageId = randomUUID();
    const pendingOutput = await createAskQuestionTool({
      isWorkspaceSetupThread: false,
    }).execute(QUESTION);

    await getAppProviderByClassName<AgentConversationWriterService>(
      'AgentConversationWriterService',
    ).upsertAssistantMessage({
      id: assistantMessageId,
      threadId,
      turnId: userMessage.turnId,
      workspaceId,
      parts: toolCallIds.map((toolCallId) => ({
        type: 'tool-ask_question',
        toolCallId,
        state: 'output-available',
        input: QUESTION,
        output: pendingOutput,
      })) as never,
    });

    await global.testDataSource.query(
      `UPDATE "${schema}"."agentChatThread" SET "pendingQuestionMessageId" = $1 WHERE id = $2`,
      [assistantMessageId, threadId],
    );

    return { assistantMessageId };
  };

  const pauseOnProposal = async (toolCallId: string) => {
    await pauseOnQuestions(toolCallId);
    await global.testDataSource.query(
      `UPDATE "${schema}"."agentMessagePart"
       SET "toolName" = 'propose_tool_call', "toolInput" = $2::jsonb,
         "toolOutput" = $3::jsonb
       WHERE "toolCallId" = $1`,
      [
        toolCallId,
        JSON.stringify(PROPOSAL_INPUT),
        JSON.stringify(
          buildProposeToolCallPendingOutput(
            buildFallbackProposedToolCall(PROPOSAL_INPUT),
          ),
        ),
      ],
    );
  };

  const answerQuestions = (toolCallId: string) =>
    answerToolCall({
      toolCall: { threadId, toolCallId },
      response: { selectedOptionIndices: [1] },
    });

  const readPendingQuestionMessageId = async () =>
    (
      await global.testDataSource.query(
        `SELECT "pendingQuestionMessageId" FROM "${schema}"."agentChatThread" WHERE id = $1`,
        [threadId],
      )
    )[0].pendingQuestionMessageId;

  const readToolCallStatus = async (toolCallId: string) =>
    (
      await global.testDataSource.query(
        `SELECT "toolOutput" FROM "${schema}"."agentMessagePart" WHERE "toolCallId" = $1`,
        [toolCallId],
      )
    )[0]?.toolOutput?.result?.status;

  const markAsMentioned = (memberId = workspaceMemberId) =>
    getAppProviderByClassName<AgentChatThreadParticipantService>(
      'AgentChatThreadParticipantService',
    ).markAsMentioned({ workspaceId, workspaceMemberId: memberId, threadId });

  const readMentionState = async (memberId = workspaceMemberId) => {
    const [participant]: {
      lastMentionedAt: Date | null;
      mentionsResolvedAt: Date | null;
    }[] = await global.testDataSource.query(
      `SELECT "lastMentionedAt", "mentionsResolvedAt" FROM "${schema}"."agentChatThreadParticipant"
       WHERE "threadId" = $1 AND "workspaceMemberId" = $2`,
      [threadId, memberId],
    );

    return participant;
  };

  const expectMentionResolved = async () => {
    const participant = await readMentionState();

    expect(participant.mentionsResolvedAt).toEqual(participant.lastMentionedAt);
  };

  const expectNewerMentionPending = async (resolvedMentionAt: Date | null) => {
    const participant = await readMentionState();

    expect(participant.mentionsResolvedAt).toEqual(resolvedMentionAt);
    expect(participant.lastMentionedAt!.getTime()).toBeGreaterThan(
      participant.mentionsResolvedAt!.getTime(),
    );
  };

  const stopStream = () =>
    makeMetadataApiRequest({
      query: parse(
        'mutation Stop($threadId: UUID!) { stopAgentChatStream(threadId: $threadId) }',
      ),
      variables: { threadId },
    });

  beforeAll(async () => {
    chat = getAppProviderByClassName<AgentChatService>('AgentChatService');

    const aiModelRegistryService =
      getAppProviderByClassName<AiModelRegistryService>(
        'AiModelRegistryService',
      );

    spies.push(
      jest
        .spyOn(aiModelRegistryService, 'getAvailableModels')
        .mockReturnValue([{ modelId: 'test-model' }] as never),
      jest
        .spyOn(aiModelRegistryService, 'validateModelAvailability')
        .mockReturnValue(undefined as never),
    );
    enqueueStream = jest
      .spyOn(
        global.app.get<MessageQueueService>(
          getQueueToken(MessageQueue.aiStreamQueue),
        ),
        'add',
      )
      .mockResolvedValue(undefined as never);
    spies.push(enqueueStream);

    await getAgentChatThreadService().createThread({
      workspaceId,
      workspaceMemberId,
      id: threadId,
      title: 'Tool call resolution',
    });
  });

  afterAll(async () => {
    spies.forEach((spy) => spy.mockRestore());
    await destroyAgentChatThread({ threadId });
  });

  afterEach(async () => {
    for (const spy of testSpies.splice(0)) {
      spy.mockRestore();
    }

    await stopStream();
  });

  it('answers the call once, records the answer, stops waiting and resumes the chat', async () => {
    const { assistantMessageId } = await pauseOnQuestions('call-answered');

    expect(await readPendingQuestionMessageId()).toBe(assistantMessageId);

    const response = await answerQuestions('call-answered');

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.answerToolCall.streamId).toEqual(
      expect.any(String),
    );
    expect(await readToolCallStatus('call-answered')).toBe('answered');
    expect(await readPendingQuestionMessageId()).toBeNull();
    expect(enqueueStream).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({
        threadId,
        streamId: response.body.data.answerToolCall.streamId,
        userWorkspaceId,
      }),
      expect.anything(),
    );

    await stopStream();

    const second = await answerQuestions('call-answered');

    expect(JSON.stringify(second.body.errors)).toContain(
      'TOOL_CALL_NOT_PENDING',
    );
  });

  it('resumes the chat only once every question asked together is answered', async () => {
    await pauseOnQuestions('call-first', 'call-last');
    enqueueStream.mockClear();

    const first = await answerQuestions('call-first');

    expect(first.body.errors).toBeUndefined();
    expect(first.body.data.answerToolCall.streamId).toBeNull();
    expect(await readToolCallStatus('call-first')).toBe('answered');
    expect(await readToolCallStatus('call-last')).toBe('pending');
    expect(await readPendingQuestionMessageId()).not.toBeNull();
    expect(enqueueStream).not.toHaveBeenCalled();

    const last = await answerQuestions('call-last');

    expect(last.body.errors).toBeUndefined();
    expect(last.body.data.answerToolCall.streamId).toEqual(expect.any(String));
    expect(await readPendingQuestionMessageId()).toBeNull();
    expect(enqueueStream).toHaveBeenCalledTimes(1);
    expect(enqueueStream).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({
        threadId,
        streamId: last.body.data.answerToolCall.streamId,
      }),
      expect.anything(),
    );
  });

  it('keeps the mention unresolved when a submitted answer is invalid', async () => {
    await pauseOnQuestions('invalid-mention-answer');
    await markAsMentioned();

    const mentionBefore = await readMentionState();
    const response = await answerToolCall({
      toolCall: { threadId, toolCallId: 'invalid-mention-answer' },
      response: { selectedOptionIndices: [] },
    });

    expect(JSON.stringify(response.body.errors)).toContain(
      'INVALID_TOOL_CALL_OUTPUT',
    );
    expect(await readMentionState()).toEqual(mentionBefore);
    expect(await readToolCallStatus('invalid-mention-answer')).toBe('pending');
  });

  it('resolves only the answering member while another request remains pending', async () => {
    await pauseOnQuestions('mention-first-answer', 'mention-pending-answer');
    await getAgentChatThreadService().mentionParticipants({
      workspaceId,
      workspaceMemberId,
      threadId,
      participantWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });
    await markAsMentioned();

    const otherMemberBefore = await readMentionState(
      WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    );
    const response = await answerQuestions('mention-first-answer');

    expect(response.body.errors).toBeUndefined();

    await expectMentionResolved();
    expect(await readMentionState(WORKSPACE_MEMBER_DATA_SEED_IDS.JONY)).toEqual(
      otherMemberBefore,
    );
    expect(await readToolCallStatus('mention-pending-answer')).toBe('pending');
    expect(await readPendingQuestionMessageId()).not.toBeNull();
  });

  it('resolves a successfully recorded rejection of a proposed action', async () => {
    const toolCallId = 'mention-rejected-action';

    await pauseOnProposal(toolCallId);
    await markAsMentioned();

    const response = await answerToolCall({
      toolCall: { threadId, toolCallId },
      response: { decision: 'reject' },
    });

    expect(response.body.errors).toBeUndefined();
    expect(await readToolCallStatus(toolCallId)).toBe('rejected');
    await expectMentionResolved();
  });

  it('preserves a new mention arriving while an accepted approval executes', async () => {
    const toolCallId = 'mention-during-approved-execution';

    await pauseOnProposal(toolCallId);
    await markAsMentioned();

    const acceptedMention = await readMentionState();
    const toolRegistry = getAppProviderByClassName<ToolRegistryService>(
      'ToolRegistryService',
    );
    const executeTool = jest
      .spyOn(toolRegistry, 'resolveAndExecute')
      .mockImplementationOnce(async () => {
        await expectMentionResolved();
        expect(await readToolCallStatus(toolCallId)).toBe('running');

        await markAsMentioned();

        return { success: true, message: 'Company created', result: {} };
      });

    testSpies.push(executeTool);

    const response = await answerToolCall({
      toolCall: { threadId, toolCallId },
      response: { decision: 'approve' },
    });

    expect(response.body.errors).toBeUndefined();
    expect(executeTool).toHaveBeenCalledTimes(1);
    expect(await readToolCallStatus(toolCallId)).toBe('approved');
    await expectNewerMentionPending(acceptedMention.lastMentionedAt);
  });

  it('keeps an accepted answer resolved when its authored response cannot be created', async () => {
    await pauseOnQuestions('accepted-before-message-failure');
    await markAsMentioned();

    testSpies.push(
      jest
        .spyOn(chat, 'addMessage')
        .mockRejectedValueOnce(
          new Error('Authored response could not be created'),
        ),
    );

    const response = await answerQuestions('accepted-before-message-failure');

    expect(response.body.errors).toBeDefined();
    expect(await readToolCallStatus('accepted-before-message-failure')).toBe(
      'answered',
    );
    await expectMentionResolved();
    expect(await readPendingQuestionMessageId()).toBeNull();
  });

  it('rolls back the recorded answer and pending marker when its resolution transaction fails', async () => {
    const { assistantMessageId } = await pauseOnQuestions(
      'rolled-back-mention-answer',
    );

    await markAsMentioned();

    const mentionBefore = await readMentionState();
    const participantService =
      getAppProviderByClassName<AgentChatThreadParticipantService>(
        'AgentChatThreadParticipantService',
      );
    const resolveMention =
      participantService.resolveMention.bind(participantService);

    testSpies.push(
      jest
        .spyOn(participantService, 'resolveMention')
        .mockImplementationOnce((resolveMentionArgs) =>
          resolveMention({
            ...resolveMentionArgs,
            writeResponse: async (
              context: Parameters<AgentChatThreadWriteStep>[0],
            ) => {
              await resolveMentionArgs.writeResponse(context);

              throw new Error('Response transaction could not commit');
            },
          }),
        ),
    );

    const response = await answerQuestions('rolled-back-mention-answer');

    expect(response.body.errors).toBeDefined();
    expect(await readToolCallStatus('rolled-back-mention-answer')).toBe(
      'pending',
    );
    expect(await readPendingQuestionMessageId()).toBe(assistantMessageId);
    expect(await readMentionState()).toEqual(mentionBefore);
  });

  it('preserves a new mention arriving between the accepted answer and its authored response', async () => {
    await pauseOnQuestions('mention-before-authored-response');
    await markAsMentioned();

    const previousMention = await readMentionState();
    const addMessage = chat.addMessage.bind(chat);

    testSpies.push(
      jest
        .spyOn(chat, 'addMessage')
        .mockImplementationOnce(async (addMessageArgs) => {
          await markAsMentioned();

          return addMessage(addMessageArgs);
        }),
    );

    const response = await answerQuestions('mention-before-authored-response');

    expect(response.body.errors).toBeUndefined();
    await expectNewerMentionPending(previousMention.lastMentionedAt);
  });

  it('answers the questions of a step in any order', async () => {
    await pauseOnQuestions(
      'unordered-first',
      'unordered-middle',
      'unordered-last',
    );
    enqueueStream.mockClear();

    const middle = await answerQuestions('unordered-middle');

    expect(middle.body.errors).toBeUndefined();
    expect(middle.body.data.answerToolCall.streamId).toBeNull();
    expect(await readToolCallStatus('unordered-first')).toBe('pending');
    expect(await readToolCallStatus('unordered-middle')).toBe('answered');

    const last = await answerQuestions('unordered-last');

    expect(last.body.errors).toBeUndefined();
    expect(await readToolCallStatus('unordered-last')).toBe('answered');
    expect(await readToolCallStatus('unordered-first')).toBe('pending');

    const first = await answerQuestions('unordered-first');

    expect(first.body.errors).toBeUndefined();
    expect(first.body.data.answerToolCall.streamId).toEqual(expect.any(String));
    expect(await readPendingQuestionMessageId()).toBeNull();
    expect(enqueueStream).toHaveBeenCalledTimes(1);
  });

  it('closes every pending call when a message is sent instead of the answers', async () => {
    await pauseOnQuestions('call-skipped-first', 'call-skipped-last');

    const response = await makeMetadataApiRequest({
      query: parse(
        `mutation Send($threadId: UUID!, $text: String!, $messageId: UUID!) {
          sendChatMessage(threadId: $threadId, text: $text, messageId: $messageId) { queued streamId }
        }`,
      ),
      variables: { threadId, text: 'Never mind', messageId: randomUUID() },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.queued).toBe(false);

    expect(await readPendingQuestionMessageId()).toBeNull();

    for (const toolCallId of ['call-skipped-first', 'call-skipped-last']) {
      expect(await readToolCallStatus(toolCallId)).toBe('skipped');
    }

    const lateAnswer = await answerQuestions('call-skipped-first');

    expect(JSON.stringify(lateAnswer.body.errors)).toContain(
      'TOOL_CALL_NOT_PENDING',
    );
  });
});
