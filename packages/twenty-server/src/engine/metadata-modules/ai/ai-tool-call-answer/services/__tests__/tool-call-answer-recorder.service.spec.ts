import { Test } from '@nestjs/testing';

import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { getAgentHistoryRepositoryToken } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentTurnEventPublisherService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-event-publisher.service';
import { ToolCallAnswerRecorderService } from 'src/engine/metadata-modules/ai/ai-tool-call-answer/services/tool-call-answer-recorder.service';

const buildService = async () => {
  const threadRecordEventService = {
    emitPendingQuestionCleared: jest.fn().mockResolvedValue(undefined),
  };
  const turnEventPublisherService = {
    publish: jest.fn().mockResolvedValue(undefined),
  };
  const messagePartRepository = {
    writePart: jest.fn(),
    query: jest.fn(),
  };

  messagePartRepository.query.mockImplementation(async (_workspaceId, run) =>
    run({
      table: (name: string) => name,
      manager: { query: messagePartRepository.writePart },
    }),
  );

  const module = await Test.createTestingModule({
    providers: [
      ToolCallAnswerRecorderService,
      {
        provide: getAgentHistoryRepositoryToken('agentMessagePart'),
        useValue: messagePartRepository,
      },
      {
        provide: AgentChatThreadRecordEventService,
        useValue: threadRecordEventService,
      },
      { provide: AgentChatThreadParticipantService, useValue: {} },
      {
        provide: AgentTurnEventPublisherService,
        useValue: turnEventPublisherService,
      },
    ],
  }).compile();

  const service = module.get(ToolCallAnswerRecorderService);

  return {
    service,
    messagePartRepository,
    threadRecordEventService,
    turnEventPublisherService,
  };
};

describe('ToolCallAnswerRecorderService recordToolCallAnswer', () => {
  const answerArguments = {
    threadId: 'thread-id',
    messageId: 'question-message-id',
    partId: 'part-id',
    toolOutput: { result: { status: 'answered' } },
    workspaceId: 'workspace-id',
    resolveMentionForWorkspaceMemberId: null,
  };

  it('tells open chat lists once the last answer stops the wait', async () => {
    const {
      service,
      messagePartRepository,
      threadRecordEventService,
      turnEventPublisherService,
    } = await buildService();

    messagePartRepository.writePart
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([{ id: 'thread-id' }])
      .mockResolvedValueOnce([{ id: 'turn-id' }]);

    await service.recordToolCallAnswer({
      ...answerArguments,
      isLastAnswer: true,
    });

    expect(
      threadRecordEventService.emitPendingQuestionCleared,
    ).toHaveBeenCalledTimes(1);
    expect(turnEventPublisherService.publish).toHaveBeenCalledTimes(1);
    expect(turnEventPublisherService.publish).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      type: 'updated',
      turnIds: ['turn-id'],
    });
  });

  it('stays quiet when another caller already stopped the wait', async () => {
    const { service, messagePartRepository, threadRecordEventService } =
      await buildService();

    messagePartRepository.writePart
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([]);

    await service.recordToolCallAnswer({
      ...answerArguments,
      isLastAnswer: true,
    });

    expect(
      threadRecordEventService.emitPendingQuestionCleared,
    ).not.toHaveBeenCalled();
  });

  it('stays quiet while other calls still wait on an answer', async () => {
    const { service, threadRecordEventService } = await buildService();

    await service.recordToolCallAnswer({
      ...answerArguments,
      isLastAnswer: false,
    });

    expect(
      threadRecordEventService.emitPendingQuestionCleared,
    ).not.toHaveBeenCalled();
  });
});
