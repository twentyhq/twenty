import { generateText } from 'ai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { AI_CHAT_WORKING_CONTEXT_BUDGET_TOKENS } from 'src/engine/metadata-modules/ai/ai-chat/constants/ai-chat-working-context-budget-tokens.const';
import { MessageCompactionService } from 'src/engine/metadata-modules/ai/ai-chat/services/message-compaction.service';
import { type AgentChatThreadCompactionSummary } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-compaction-summary.type';
import { getCompactionThresholdTokens } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-compaction-threshold-tokens.util';
import { splitMessagesForCompaction } from 'src/engine/metadata-modules/ai/ai-chat/utils/split-messages-for-compaction.util';
import { type RegisteredAiModel } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

jest.mock('ai', () => ({ generateText: jest.fn() }));

const generateTextMock = generateText as jest.Mock;

const buildUserMessage = (id: string, text: string): ExtendedUIMessage => ({
  id,
  role: 'user',
  parts: [{ type: 'text', text }],
});

const buildAssistantMessage = (
  id: string,
  text: string,
): ExtendedUIMessage => ({
  id,
  role: 'assistant',
  parts: [{ type: 'text', text }],
});

// user-1, assistant-1, ..., user-N, assistant-N
const buildConversation = (turns: number): ExtendedUIMessage[] =>
  Array.from({ length: turns }).flatMap((_, index) => [
    buildUserMessage(`user-${index + 1}`, `question ${index + 1}`),
    buildAssistantMessage(`assistant-${index + 1}`, `answer ${index + 1}`),
  ]);

const threadModel = {
  modelId: 'provider/thread-model',
  model: { id: 'thread-model' },
} as unknown as RegisteredAiModel;

const speedModel = {
  modelId: 'provider/speed-model',
  model: { id: 'speed-model' },
} as unknown as RegisteredAiModel;

const buildService = ({
  persistedSummary = null,
  speedModelAvailable = true,
}: {
  persistedSummary?: AgentChatThreadCompactionSummary | null;
  speedModelAvailable?: boolean;
} = {}) => {
  const threadRepository = {
    findOne: jest.fn().mockResolvedValue({
      id: 'thread-id',
      compactionSummary: persistedSummary,
    }),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const aiModelRegistryService = {
    getDefaultSpeedModel: speedModelAvailable
      ? jest.fn().mockReturnValue(speedModel)
      : jest.fn().mockImplementation(() => {
          throw new Error('No AI models are available');
        }),
  };

  const aiBillingService = {
    calculateAndBillUsage: jest.fn().mockResolvedValue(undefined),
  };

  const service = new MessageCompactionService(
    threadRepository as never,
    aiModelRegistryService as never,
    aiBillingService as never,
  );

  return {
    service,
    threadRepository,
    aiModelRegistryService,
    aiBillingService,
  };
};

const baseInput = {
  threadId: 'thread-id',
  workspaceId: 'workspace-id',
  userWorkspaceId: 'user-workspace-id',
  threadModel,
};

describe('getCompactionThresholdTokens', () => {
  it('should use 85% of the window when the window is small', () => {
    expect(getCompactionThresholdTokens(100_000)).toBe(85_000);
  });

  it('should cap at the working context budget for large windows', () => {
    expect(getCompactionThresholdTokens(1_050_000)).toBe(
      AI_CHAT_WORKING_CONTEXT_BUDGET_TOKENS,
    );
  });
});

describe('splitMessagesForCompaction', () => {
  it('should keep the last 2 user turns verbatim', () => {
    const messages = buildConversation(4);

    const { messagesToCompact, messagesToKeep } =
      splitMessagesForCompaction(messages);

    expect(messagesToCompact.map((message) => message.id)).toEqual([
      'user-1',
      'assistant-1',
      'user-2',
      'assistant-2',
    ]);
    expect(messagesToKeep.map((message) => message.id)).toEqual([
      'user-3',
      'assistant-3',
      'user-4',
      'assistant-4',
    ]);
  });

  it('should not compact anything when there are 2 or fewer user turns', () => {
    const messages = buildConversation(2);

    const { messagesToCompact, messagesToKeep } =
      splitMessagesForCompaction(messages);

    expect(messagesToCompact).toEqual([]);
    expect(messagesToKeep).toEqual(messages);
  });
});

describe('MessageCompactionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    generateTextMock.mockResolvedValue({
      text: 'structured summary',
      usage: { inputTokens: 100, outputTokens: 50 },
      steps: [],
    });
  });

  it('should not compact when the conversation is under the threshold', async () => {
    const { service } = buildService();
    const messages = buildConversation(4);

    const result = await service.compactIfOverBudget({
      ...baseInput,
      messages,
      contextWindowTokens: 1_050_000,
      conversationSizeTokens: AI_CHAT_WORKING_CONTEXT_BUDGET_TOKENS,
    });

    expect(result.wasCompacted).toBe(false);
    expect(result.messages).toEqual(messages);
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it('should compact when over the working budget even if far below the window', async () => {
    const { service, threadRepository } = buildService();
    const messages = buildConversation(4);

    const result = await service.compactIfOverBudget({
      ...baseInput,
      messages,
      contextWindowTokens: 1_050_000,
      conversationSizeTokens: AI_CHAT_WORKING_CONTEXT_BUDGET_TOKENS + 1,
    });

    expect(result.wasCompacted).toBe(true);
    expect(result.messages[0].role).toBe('user');
    expect(result.messages[0].parts[0]).toMatchObject({
      type: 'text',
      text: expect.stringContaining('structured summary'),
    });
    expect(result.messages.slice(1).map((message) => message.id)).toEqual([
      'user-3',
      'assistant-3',
      'user-4',
      'assistant-4',
    ]);

    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id' },
      {
        compactionSummary: expect.objectContaining({
          text: 'structured summary',
          lastCompactedMessageId: 'assistant-2',
        }),
      },
    );
  });

  it('should compact against 85% of the window for small windows', async () => {
    const { service } = buildService();
    const messages = buildConversation(4);

    const result = await service.compactIfOverBudget({
      ...baseInput,
      messages,
      contextWindowTokens: 100_000,
      conversationSizeTokens: 85_001,
    });

    expect(result.wasCompacted).toBe(true);
  });

  it('should use the default speed model for summarization', async () => {
    const { service } = buildService();

    await service.compactIfOverBudget({
      ...baseInput,
      messages: buildConversation(4),
      contextWindowTokens: 1_050_000,
      conversationSizeTokens: 200_000,
    });

    expect(generateTextMock).toHaveBeenCalledWith(
      expect.objectContaining({ model: speedModel.model }),
    );
  });

  it('should fall back to the thread model when no speed model is available', async () => {
    const { service } = buildService({ speedModelAvailable: false });

    await service.compactIfOverBudget({
      ...baseInput,
      messages: buildConversation(4),
      contextWindowTokens: 1_050_000,
      conversationSizeTokens: 200_000,
    });

    expect(generateTextMock).toHaveBeenCalledWith(
      expect.objectContaining({ model: threadModel.model }),
    );
  });

  it('should feed the persisted summary as the anchor and only summarize newer messages', async () => {
    const persistedSummary: AgentChatThreadCompactionSummary = {
      text: 'previous anchor summary',
      lastCompactedMessageId: 'assistant-2',
      compactedAt: '2026-01-01T00:00:00.000Z',
    };
    const { service, threadRepository } = buildService({ persistedSummary });
    const messages = buildConversation(6);

    const result = await service.compactIfOverBudget({
      ...baseInput,
      messages,
      contextWindowTokens: 1_050_000,
      conversationSizeTokens: 200_000,
    });

    expect(result.wasCompacted).toBe(true);

    const prompt = generateTextMock.mock.calls[0][0].prompt as string;

    expect(prompt).toContain('previous anchor summary');
    // Messages covered by the anchor are not re-summarized.
    expect(prompt).not.toContain('question 1');
    expect(prompt).not.toContain('question 2');
    expect(prompt).toContain('question 3');
    expect(prompt).toContain('question 4');
    // The last 2 user turns stay out of the summarizer input.
    expect(prompt).not.toContain('question 5');
    expect(prompt).not.toContain('question 6');

    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id' },
      {
        compactionSummary: expect.objectContaining({
          lastCompactedMessageId: 'assistant-4',
        }),
      },
    );
  });

  it('should reuse the persisted summary without re-summarizing when under the threshold', async () => {
    const persistedSummary: AgentChatThreadCompactionSummary = {
      text: 'previous anchor summary',
      lastCompactedMessageId: 'assistant-2',
      compactedAt: '2026-01-01T00:00:00.000Z',
    };
    const { service } = buildService({ persistedSummary });
    const messages = buildConversation(4);

    const result = await service.compactIfOverBudget({
      ...baseInput,
      messages,
      contextWindowTokens: 1_050_000,
      conversationSizeTokens: 10_000,
    });

    expect(result.wasCompacted).toBe(false);
    expect(generateTextMock).not.toHaveBeenCalled();
    expect(result.messages[0].parts[0]).toMatchObject({
      type: 'text',
      text: expect.stringContaining('previous anchor summary'),
    });
    expect(result.messages.slice(1).map((message) => message.id)).toEqual([
      'user-3',
      'assistant-3',
      'user-4',
      'assistant-4',
    ]);
  });

  it('should ignore a persisted summary whose watermark is missing from the messages', async () => {
    const persistedSummary: AgentChatThreadCompactionSummary = {
      text: 'stale summary',
      lastCompactedMessageId: 'deleted-message-id',
      compactedAt: '2026-01-01T00:00:00.000Z',
    };
    const { service } = buildService({ persistedSummary });
    const messages = buildConversation(2);

    const result = await service.compactIfOverBudget({
      ...baseInput,
      messages,
      contextWindowTokens: 1_050_000,
      conversationSizeTokens: 10_000,
    });

    expect(result.messages).toEqual(messages);
  });

  it('should not re-summarize when the summary already covers everything but the kept turns', async () => {
    const persistedSummary: AgentChatThreadCompactionSummary = {
      text: 'previous anchor summary',
      lastCompactedMessageId: 'assistant-2',
      compactedAt: '2026-01-01T00:00:00.000Z',
    };
    const { service } = buildService({ persistedSummary });
    // Turns 3 and 4 are the last 2 user turns: nothing new to fold in.
    const messages = buildConversation(4);

    const result = await service.compactIfOverBudget({
      ...baseInput,
      messages,
      contextWindowTokens: 1_050_000,
      conversationSizeTokens: 200_000,
    });

    expect(result.wasCompacted).toBe(false);
    expect(generateTextMock).not.toHaveBeenCalled();
    expect(result.messages[0].parts[0]).toMatchObject({
      type: 'text',
      text: expect.stringContaining('previous anchor summary'),
    });
  });

  it('should return the original messages when the thread is too short to compact', async () => {
    const { service } = buildService();
    const messages = buildConversation(2);

    const result = await service.compactIfOverBudget({
      ...baseInput,
      messages,
      contextWindowTokens: 1_050_000,
      conversationSizeTokens: 200_000,
    });

    expect(result.wasCompacted).toBe(false);
    expect(result.messages).toEqual(messages);
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it('should fall back without compacting when the summarizer fails', async () => {
    generateTextMock.mockRejectedValue(new Error('provider unavailable'));

    const { service, threadRepository } = buildService();
    const messages = buildConversation(4);

    const result = await service.compactIfOverBudget({
      ...baseInput,
      messages,
      contextWindowTokens: 1_050_000,
      conversationSizeTokens: 200_000,
    });

    expect(result.wasCompacted).toBe(false);
    expect(result.messages).toEqual(messages);
    expect(threadRepository.update).not.toHaveBeenCalled();
  });

  it('should fall back without compacting when the summarizer returns empty text', async () => {
    generateTextMock.mockResolvedValue({
      text: '   ',
      usage: { inputTokens: 100, outputTokens: 0 },
      steps: [],
    });

    const { service } = buildService();
    const messages = buildConversation(4);

    const result = await service.compactIfOverBudget({
      ...baseInput,
      messages,
      contextWindowTokens: 1_050_000,
      conversationSizeTokens: 200_000,
    });

    expect(result.wasCompacted).toBe(false);
    expect(result.messages).toEqual(messages);
  });

  it('should skip compaction entirely without a threadId', async () => {
    const { service, threadRepository } = buildService();
    const messages = buildConversation(4);

    const result = await service.compactIfOverBudget({
      ...baseInput,
      threadId: undefined,
      messages,
      contextWindowTokens: 1_050_000,
      conversationSizeTokens: 200_000,
    });

    expect(result.wasCompacted).toBe(false);
    expect(result.messages).toEqual(messages);
    expect(threadRepository.findOne).not.toHaveBeenCalled();
  });

  it('should bill the summarization usage on the summarizer model', async () => {
    const { service, aiBillingService } = buildService();

    await service.compactIfOverBudget({
      ...baseInput,
      messages: buildConversation(4),
      contextWindowTokens: 1_050_000,
      conversationSizeTokens: 200_000,
    });

    expect(aiBillingService.calculateAndBillUsage).toHaveBeenCalledWith(
      'provider/speed-model',
      expect.objectContaining({
        usage: { inputTokens: 100, outputTokens: 50 },
      }),
      'workspace-id',
      expect.anything(),
      null,
      'user-workspace-id',
    );
  });
});
