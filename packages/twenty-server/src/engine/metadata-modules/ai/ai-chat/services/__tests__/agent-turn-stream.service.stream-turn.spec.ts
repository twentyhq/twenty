import { Test } from '@nestjs/testing';

import { AgentChatCancelSubscriberService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-cancel-subscriber.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamHeartbeatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-heartbeat.service';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentTurnStreamService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-turn-stream.service';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { getAgentHistoryRepositoryToken } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import { STREAM_EXECUTION_FAILED_CODE } from 'src/engine/metadata-modules/ai/ai-history/utils/map-error-to-stream-error.util';

const buildService = async (finish: jest.Mock) => {
  const module = await Test.createTestingModule({
    providers: [
      AgentTurnStreamService,
      {
        provide: getAgentHistoryRepositoryToken('agentChatThread'),
        useValue: {},
      },
      { provide: AgentChatEventPublisherService, useValue: {} },
      { provide: AgentChatCancelSubscriberService, useValue: {} },
      { provide: AgentChatStreamHeartbeatService, useValue: {} },
      { provide: AgentChatStreamRecoveryService, useValue: {} },
      { provide: AgentConversationWriterService, useValue: {} },
      {
        provide: AgentTurnRecorderService,
        useValue: { finish, recordUsage: jest.fn() },
      },
      { provide: AgentChatThreadService, useValue: {} },
    ],
  }).compile();

  module.useLogger(false);

  return module.get(AgentTurnStreamService);
};

const streamTurnWithoutClaim = ({
  service,
  turnError,
}: {
  service: AgentTurnStreamService;
  turnError: Error;
}) =>
  service.streamTurn({
    workspaceId: 'workspace-id',
    claim: null,
    turnId: 'turn-id',
    startTurn: () => Promise.reject(turnError),
    completeTurn: jest.fn(),
    isBackgroundRun: true,
  });

const expectFailureRecordedOnce = (finish: jest.Mock) => {
  expect(finish).toHaveBeenCalledTimes(1);
  expect(finish).toHaveBeenCalledWith({
    workspaceId: 'workspace-id',
    turnId: 'turn-id',
    status: AgentTurnStatus.FAILED,
    error: {
      code: STREAM_EXECUTION_FAILED_CODE,
      message: 'Provider unavailable',
    },
  });
};

describe('AgentTurnStreamService streamTurn without a claim', () => {
  it('records the turn as failed', async () => {
    const finish = jest.fn().mockResolvedValue(true);
    const turnError = new Error('Provider unavailable');

    await expect(
      streamTurnWithoutClaim({
        service: await buildService(finish),
        turnError,
      }),
    ).rejects.toBe(turnError);

    expectFailureRecordedOnce(finish);
  });

  it('fails with the turn error when recording the failure fails', async () => {
    const finish = jest
      .fn()
      .mockRejectedValue(new Error('Database unavailable'));
    const turnError = new Error('Provider unavailable');

    await expect(
      streamTurnWithoutClaim({
        service: await buildService(finish),
        turnError,
      }),
    ).rejects.toBe(turnError);

    expectFailureRecordedOnce(finish);
  });
});
