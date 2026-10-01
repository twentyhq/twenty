import { ASK_QUESTIONS_TOOL_NAME } from 'twenty-shared/ai';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';
const TURN_ID = 'turn-id';
const APPLICATION = {
  id: 'application-id',
  name: 'Call Recorder',
} as FlatApplication;

const QUESTIONS = [
  {
    header: 'Share',
    question: 'Do you want to share it with the other attendees?',
    options: [{ label: 'Draft a recap email' }, { label: 'Not now' }],
  },
];

const buildService = () => {
  const agentChatService = {
    createThread: jest.fn().mockResolvedValue({
      id: THREAD_ID,
      userWorkspaceId: 'user-workspace-id',
    }),
  };
  const conversationWriterService = {
    insertTurn: jest.fn().mockResolvedValue(TURN_ID),
    insertMessage: jest
      .fn()
      .mockResolvedValueOnce('hidden-message-id')
      .mockResolvedValueOnce('assistant-message-id'),
    markAwaitingAnswer: jest.fn().mockResolvedValue(undefined),
  };

  const service = new AgentInboxService(
    agentChatService as never,
    conversationWriterService as never,
  );

  return { service, agentChatService, conversationWriterService };
};

describe('AgentInboxService', () => {
  it('opens a conversation for the member with the application message first', async () => {
    const { service, agentChatService, conversationWriterService } =
      buildService();

    const result = await service.sendMessage({
      workspaceId: WORKSPACE_ID,
      application: APPLICATION,
      input: {
        workspaceMemberId: 'workspace-member-id',
        title: 'Your first call recording is ready',
        text: 'Your first call was recorded.',
        context: 'Call recording id: call-recording-1',
      },
    });

    expect(result).toEqual({ threadId: THREAD_ID });
    expect(agentChatService.createThread).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      workspaceMemberId: 'workspace-member-id',
      title: 'Your first call recording is ready',
    });

    const [hiddenMessage, assistantMessage] =
      conversationWriterService.insertMessage.mock.calls.map(
        ([message]) => message,
      );

    expect(hiddenMessage).toEqual(
      expect.objectContaining({
        turnId: TURN_ID,
        role: AgentMessageRole.USER,
        isHidden: true,
        senderUserWorkspaceId: 'user-workspace-id',
      }),
    );
    expect(hiddenMessage.parts[0].text).toContain('"Call Recorder"');
    expect(hiddenMessage.parts[0].text).toContain(
      'Call recording id: call-recording-1',
    );
    expect(assistantMessage).toEqual(
      expect.objectContaining({
        turnId: TURN_ID,
        role: AgentMessageRole.ASSISTANT,
        senderApplicationId: 'application-id',
        parts: [{ type: 'text', text: 'Your first call was recorded.' }],
      }),
    );
    expect(conversationWriterService.markAwaitingAnswer).not.toHaveBeenCalled();
  });

  it('asks its questions as a pending ask_questions call', async () => {
    const { service, conversationWriterService } = buildService();

    await service.sendMessage({
      workspaceId: WORKSPACE_ID,
      application: APPLICATION,
      input: {
        workspaceMemberId: 'workspace-member-id',
        title: 'Your first call recording is ready',
        text: 'Your first call was recorded.',
        questions: QUESTIONS,
      },
    });

    const assistantMessage =
      conversationWriterService.insertMessage.mock.calls[1][0];

    expect(assistantMessage.parts[1]).toEqual(
      expect.objectContaining({
        type: `tool-${ASK_QUESTIONS_TOOL_NAME}`,
        state: 'output-available',
        input: { questions: QUESTIONS },
        output: expect.objectContaining({
          result: { questions: QUESTIONS, status: 'pending' },
        }),
      }),
    );
    expect(conversationWriterService.markAwaitingAnswer).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      threadId: THREAD_ID,
      messageId: 'assistant-message-id',
    });
  });

  it('rejects questions an agent could not ask', async () => {
    const { service, agentChatService } = buildService();

    await expect(
      service.sendMessage({
        workspaceId: WORKSPACE_ID,
        application: APPLICATION,
        input: {
          workspaceMemberId: 'workspace-member-id',
          title: 'Title',
          text: 'Text',
          questions: [
            {
              header: 'Share',
              question: 'Share?',
              options: [{ label: 'Yes' }],
            },
          ],
        },
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_AGENT_INPUT });
    expect(agentChatService.createThread).not.toHaveBeenCalled();
  });
});
