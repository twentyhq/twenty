import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import request from 'supertest';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { type AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type InputAskWorkspaceService } from 'src/modules/input-ask/workspace-services/input-ask.workspace-service';
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
describe('Resolving a chat tool call', () => {
  const threadId = randomUUID();
  let chat: AgentChatService;
  let inputAsks: InputAskWorkspaceService;
  let enqueueStream: jest.SpyInstance;
  const spies: jest.SpyInstance[] = [];

  const pauseOnQuestion = async (toolCallId: string) => {
    const userMessage = await chat.addMessage({
      workspaceId,
      threadId,
      userWorkspaceId,
      uiMessage: {
        role: AgentMessageRole.USER,
        parts: [{ type: 'text', text: 'Draft a quote' }],
      },
    });

    await chat.upsertAssistantMessage({
      id: randomUUID(),
      threadId,
      turnId: userMessage.turnId,
      workspaceId,
      parts: [
        {
          type: 'tool-ask_questions',
          toolCallId,
          state: 'output-available',
          input: { questions: QUESTIONS },
          output: {
            success: true,
            message: 'Questions presented to the user; awaiting their answer.',
            result: { questions: QUESTIONS, status: 'pending' },
          },
        },
      ] as never,
    });

    await inputAsks.open({
      workspaceId,
      inputAsk: {
        name: QUESTIONS[0].question,
        form: { questions: QUESTIONS },
        threadId,
        toolCallId,
        assigneeId: workspaceMemberId,
      },
    });
  };

  const resolveToolCall = (toolCallId: string) =>
    request(`http://localhost:${APP_PORT}`)
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `mutation Resolve($input: ResolveToolCallInput!) {
          resolveToolCall(input: $input) { streamId }
        }`,
        variables: {
          input: {
            threadId,
            toolCallId,
            output: {
              answers: [{ questionIndex: 0, selectedOptionIndices: [1] }],
            },
          },
        },
      });

  const readAsk = async (toolCallId: string) =>
    (
      await global.testDataSource.query(
        `SELECT status, response FROM "${schema}"."inputAsk" WHERE "threadId" = $1 AND "toolCallId" = $2`,
        [threadId, toolCallId],
      )
    )[0];

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
    inputAsks = getAppProviderByClassName<InputAskWorkspaceService>(
      'InputAskWorkspaceService',
    );

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
    await chat.hardDeleteThread({ workspaceId, workspaceMemberId, threadId });
  });

  afterEach(async () => {
    await stopStream();
  });

  it('answers the Ask once, records the answer and resumes the chat', async () => {
    await pauseOnQuestion('call-answered');

    expect(await readAsk('call-answered')).toEqual({
      status: 'PENDING',
      response: null,
    });

    const response = await resolveToolCall('call-answered');

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.resolveToolCall.streamId).toEqual(
      expect.any(String),
    );
    expect(await readAsk('call-answered')).toEqual({
      status: 'ANSWERED',
      response: {
        answers: [{ questionIndex: 0, selectedOptionIndices: [1] }],
      },
    });
    expect(await readToolCallStatus('call-answered')).toBe('answered');
    expect(enqueueStream).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({
        threadId,
        streamId: response.body.data.resolveToolCall.streamId,
        userWorkspaceId,
      }),
    );

    await stopStream();

    const second = await resolveToolCall('call-answered');

    expect(JSON.stringify(second.body.errors)).toContain(
      'TOOL_CALL_NOT_PENDING',
    );
  });

  it('cancels a pending Ask when a message is sent instead of an answer', async () => {
    await pauseOnQuestion('call-skipped');

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
    expect(await readAsk('call-skipped')).toEqual({
      status: 'CANCELED',
      response: null,
    });
    expect(await readToolCallStatus('call-skipped')).toBe('skipped');

    const lateAnswer = await resolveToolCall('call-skipped');

    expect(JSON.stringify(lateAnswer.body.errors)).toContain(
      'TOOL_CALL_NOT_PENDING',
    );
  });
});
