import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import { answerToolCall } from 'test/integration/graphql/suites/workflow/utils/answer-tool-call.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { createAskQuestionsTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/ask-questions.tool';
import { type AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const schema = getWorkspaceSchemaName(workspaceId);
const workspaceMemberId = WORKSPACE_MEMBER_DATA_SEED_IDS.JANE;
const userWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.JANE;

const QUESTIONS = [
  {
    header: 'Plan',
    question: 'Which plan should I quote?',
    options: [{ label: 'Pro' }, { label: 'Team' }],
  },
];

// The model is not called here: the turn that asked is written as the stream
// job persists it, and the resumed stream is only checked for being queued.
describe('Answering a chat tool call', () => {
  const threadId = randomUUID();
  let chat: AgentChatService;
  let enqueueStream: jest.SpyInstance;
  const spies: jest.SpyInstance[] = [];

  // One assistant message that calls ask_questions once per id, as a model
  // asking several things in one step does.
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
    const pendingOutput = await createAskQuestionsTool({
      isWorkspaceSetupThread: false,
    }).execute({ questions: QUESTIONS });

    await chat.upsertAssistantMessage({
      id: assistantMessageId,
      threadId,
      turnId: userMessage.turnId,
      workspaceId,
      parts: toolCallIds.map((toolCallId) => ({
        type: 'tool-ask_questions',
        toolCallId,
        state: 'output-available',
        input: { questions: QUESTIONS },
        output: pendingOutput,
      })) as never,
    });

    // Written in the same update as the turn's totals.
    await global.testDataSource.query(
      `UPDATE "${schema}"."agentChatThread" SET "pendingQuestionMessageId" = $1 WHERE id = $2`,
      [assistantMessageId, threadId],
    );

    return { assistantMessageId };
  };

  const answerQuestions = (toolCallId: string) =>
    answerToolCall({
      toolCall: { threadId, toolCallId },
      response: { answers: [{ questionIndex: 0, selectedOptionIndices: [1] }] },
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

    await chat.createThread({
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
    );
  });

  it('still answers a question through the deprecated answerAgentChatQuestion', async () => {
    const { assistantMessageId } = await pauseOnQuestions('call-legacy');
    enqueueStream.mockClear();

    const response = await makeMetadataApiRequest({
      query: parse(
        `mutation Answer($threadId: UUID!, $messageId: UUID!, $answers: [AgentChatQuestionAnswerInput!]!) {
          answerAgentChatQuestion(threadId: $threadId, messageId: $messageId, answers: $answers) { messageId queued streamId }
        }`,
      ),
      variables: {
        threadId,
        messageId: assistantMessageId,
        answers: [{ questionIndex: 0, selectedOptionIndices: [1] }],
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.answerAgentChatQuestion).toMatchObject({
      messageId: assistantMessageId,
      queued: false,
      streamId: expect.any(String),
    });
    expect(await readToolCallStatus('call-legacy')).toBe('answered');
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
