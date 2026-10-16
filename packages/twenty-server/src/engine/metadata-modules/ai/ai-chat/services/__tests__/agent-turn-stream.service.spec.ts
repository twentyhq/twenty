import {
  ASK_QUESTION_TOOL_NAME,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';

import {
  type AgentTurnStreamResult,
  AgentTurnStreamService,
} from 'src/engine/metadata-modules/ai/ai-chat/services/agent-turn-stream.service';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

const CLAIM = {
  workspaceId: 'workspace-id',
  threadId: 'thread-id',
  streamId: 'stream-id',
};

const QUESTION = {
  header: 'Plan',
  question: 'Which plan?',
  options: [{ label: 'Pro' }, { label: 'Team' }],
};

const buildResult = (
  replyParts: ExtendedUIMessagePart[],
  overrides: Partial<AgentTurnStreamResult> = {},
): AgentTurnStreamResult => ({
  assistantMessageId: 'assistant-message-id',
  replyParts,
  isAborted: false,
  streamError: undefined,
  usage: {
    inputTokens: 10,
    outputTokens: 2,
    inputCredits: 0,
    outputCredits: 0,
    cacheReadTokens: 0,
    cacheCreationTokens: 0,
    conversationSize: 10,
  },
  modelConfig: { contextWindowTokens: 100_000 } as never,
  ...overrides,
});

const buildService = () => {
  const threadUsageQuery = jest.fn(
    async (_sql?: string, _parameters?: unknown[]) => [{ id: 'thread-id' }],
  );
  const threadRepository = {
    findOne: jest.fn().mockResolvedValue({ id: 'thread-id', deletedAt: null }),
    query: jest.fn().mockImplementation(async (_workspaceId, work) =>
      work({
        table: () => '"workspace"."agentChatThread"',
        manager: { query: threadUsageQuery },
      }),
    ),
  };
  const conversationWriterService = {
    upsertAssistantMessage: jest.fn().mockResolvedValue(undefined),
  };
  const turnRecorderService = {
    recordUsage: jest.fn().mockResolvedValue(undefined),
    finish: jest.fn().mockResolvedValue(true),
  };

  const service = new AgentTurnStreamService(
    threadRepository as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    conversationWriterService as never,
    turnRecorderService as never,
    { recordThreadActivity: jest.fn() } as never,
  );

  const finishRun = (result: AgentTurnStreamResult, isWaiting = false) =>
    service.finishTurn({
      claim: CLAIM,
      turnId: 'turn-id',
      result,
      modelId: 'model-id',
      isOutOfCredits: false,
      isWaiting,
      shouldRecordReplyActivity: false,
    });

  const threadUpdate = () => {
    const [sql, parameters] = threadUsageQuery.mock.calls[0] ?? [];

    return {
      recordsActivity: String(sql).includes('"lastActivityAt"'),
      pendingQuestionMessageId: (parameters as unknown[])[4],
    };
  };

  return {
    finishRun,
    threadUpdate,
    conversationWriterService,
    turnRecorderService,
  };
};

describe('AgentTurnStreamService', () => {
  it('records a run that waits on an event as waiting, out of the inbox', async () => {
    const { finishRun, threadUpdate, turnRecorderService } = buildService();

    await finishRun(
      buildResult([
        {
          type: 'tool-wait_for_duration',
          toolCallId: 'wait-call-id',
          state: 'output-available',
          input: { durationInMinutes: 5 },
          output: { success: true, result: { status: 'pending' } },
        } as ExtendedUIMessagePart,
      ]),
      true,
    );

    expect(turnRecorderService.finish).toHaveBeenCalledWith(
      expect.objectContaining({ status: AgentTurnStatus.WAITING_FOR_INPUT }),
    );
    expect(threadUpdate()).toEqual({
      recordsActivity: false,
      pendingQuestionMessageId: null,
    });
  });

  it('brings a run that asked a question back to the inbox, waiting on its message', async () => {
    const { finishRun, threadUpdate, turnRecorderService } = buildService();

    const finished = await finishRun(
      buildResult([
        {
          type: `tool-${ASK_QUESTION_TOOL_NAME}`,
          toolCallId: 'ask-call-id',
          state: 'output-available',
          input: QUESTION,
          output: { result: { question: QUESTION, status: 'pending' } },
        } as ExtendedUIMessagePart,
      ]),
    );

    expect(finished?.isAwaitingAnswer).toBe(true);
    expect(turnRecorderService.finish).toHaveBeenCalledWith(
      expect.objectContaining({ status: AgentTurnStatus.WAITING_FOR_INPUT }),
    );
    expect(threadUpdate()).toEqual({
      recordsActivity: true,
      pendingQuestionMessageId: 'assistant-message-id',
    });
  });

  it('keeps a run reply nobody waits on out of the inbox', async () => {
    const { finishRun, threadUpdate, turnRecorderService } = buildService();

    await finishRun(buildResult([{ type: 'text', text: 'Quote sent' }]));

    expect(turnRecorderService.finish).toHaveBeenCalledWith(
      expect.objectContaining({ status: AgentTurnStatus.COMPLETED }),
    );
    expect(threadUpdate().recordsActivity).toBe(false);
  });

  it('records only the usage of a turn whose stream failed', async () => {
    const { finishRun, conversationWriterService, turnRecorderService } =
      buildService();

    await expect(
      finishRun(
        buildResult([{ type: 'text', text: 'Partial' }], {
          streamError: new Error('provider down'),
        }),
      ),
    ).resolves.toBeNull();

    expect(turnRecorderService.recordUsage).toHaveBeenCalled();
    expect(
      conversationWriterService.upsertAssistantMessage,
    ).not.toHaveBeenCalled();
    expect(turnRecorderService.finish).not.toHaveBeenCalled();
  });
});
