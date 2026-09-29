import { ASK_QUESTIONS_TOOL_NAME } from 'twenty-shared/ai';
import { IsNull } from 'typeorm';

import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';
const QUESTION_MESSAGE_ID = 'question-message-id';

const QUESTIONS = [
  {
    header: 'Quote',
    question: 'Send the quote?',
    options: [{ label: 'Send it' }, { label: 'Hold it' }],
  },
];

const buildService = () => {
  const threadRepository = {
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  const messageRepository = {
    findOne: jest.fn().mockResolvedValue({
      id: QUESTION_MESSAGE_ID,
      turnId: 'turn-id',
      parts: [
        {
          id: 'part-id',
          toolName: ASK_QUESTIONS_TOOL_NAME,
          toolOutput: { result: { questions: QUESTIONS, status: 'pending' } },
        },
      ],
    }),
  };
  const messagePartRepository = {
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const service = new AgentChatService(
    threadRepository as never,
    {} as never,
    messageRepository as never,
    messagePartRepository as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

  return { service, threadRepository, messagePartRepository };
};

const resolveWithoutStream = (service: AgentChatService) =>
  service.resolvePendingQuestion({
    threadId: THREAD_ID,
    messageId: QUESTION_MESSAGE_ID,
    answers: [{ questionIndex: 0, selectedOptionIndices: [0] }],
    streamId: null,
    workspaceId: WORKSPACE_ID,
  });

describe('AgentChatService resolvePendingQuestion without a stream', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('claims the question by clearing its marker, leaving the thread free', async () => {
    const { service, threadRepository, messagePartRepository } = buildService();

    const resolved = await resolveWithoutStream(service);

    expect(threadRepository.update).toHaveBeenCalledTimes(1);
    expect(threadRepository.update).toHaveBeenCalledWith(
      WORKSPACE_ID,
      { id: THREAD_ID, pendingQuestionMessageId: QUESTION_MESSAGE_ID },
      { pendingQuestionMessageId: null },
    );
    expect(messagePartRepository.update).toHaveBeenCalledWith(
      WORKSPACE_ID,
      { id: 'part-id' },
      expect.objectContaining({
        toolOutput: expect.objectContaining({
          result: expect.objectContaining({ status: 'answered' }),
        }),
      }),
    );
    expect(resolved.answerText).toBe('Send the quote?\nSend it');
  });

  it('refuses an answer another one has already claimed', async () => {
    const { service, threadRepository, messagePartRepository } = buildService();

    threadRepository.update.mockResolvedValue({ affected: 0 });

    await expect(resolveWithoutStream(service)).rejects.toThrow(
      'No pending question to answer',
    );
    expect(threadRepository.update).toHaveBeenCalledTimes(1);
    expect(messagePartRepository.update).not.toHaveBeenCalled();
  });

  it('puts the marker back when the question cannot be marked answered', async () => {
    const { service, threadRepository, messagePartRepository } = buildService();

    messagePartRepository.update.mockRejectedValue(new Error('write failed'));

    await expect(resolveWithoutStream(service)).rejects.toThrow('write failed');
    expect(threadRepository.update).toHaveBeenLastCalledWith(
      WORKSPACE_ID,
      { id: THREAD_ID, pendingQuestionMessageId: IsNull() },
      { pendingQuestionMessageId: QUESTION_MESSAGE_ID },
    );
  });
});
