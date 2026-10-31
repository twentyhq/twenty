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

const buildService = async (
  finish: jest.Mock,
  eventPublisherService: Record<string, jest.Mock> = {},
) => {
  const module = await Test.createTestingModule({
    providers: [
      AgentTurnStreamService,
      {
        provide: getAgentHistoryRepositoryToken('agentChatThread'),
        useValue: {},
      },
      {
        provide: AgentChatEventPublisherService,
        useValue: eventPublisherService,
      },
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
  streamChannelId,
}: {
  service: AgentTurnStreamService;
  turnError: Error;
  streamChannelId?: string;
}) =>
  service.streamTurn({
    workspaceId: 'workspace-id',
    claim: null,
    streamChannelId,
    turnId: 'turn-id',
    startTurn: () => Promise.reject(turnError),
    completeTurn: jest.fn(),
    isBackgroundRun: true,
  });

const REPLY_PARTS = [
  { type: 'start' },
  { type: 'text-start', id: 'text-1' },
  { type: 'text-delta', id: 'text-1', text: 'Acme renews in May' },
  { type: 'text-end', id: 'text-1' },
  { type: 'finish', finishReason: 'stop', totalUsage: {} },
];

const streamReplyWithoutClaim = ({
  service,
  streamChannelId,
}: {
  service: AgentTurnStreamService;
  streamChannelId?: string;
}) =>
  service.streamTurn({
    workspaceId: 'workspace-id',
    claim: null,
    streamChannelId,
    turnId: 'turn-id',
    startTurn: async () => ({
      source: {
        modelConfig: { contextWindowTokens: 1000 } as never,
        parts: new ReadableStream({
          start(controller) {
            REPLY_PARTS.forEach((part) => controller.enqueue(part as never));
            controller.close();
          },
        }),
      },
    }),
    completeTurn: async () => ({ modelId: 'model-id', stopReason: null }),
    isBackgroundRun: true,
  });

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

    expect(finish).toHaveBeenCalledWith(
      expect.objectContaining({
        turnId: 'turn-id',
        status: AgentTurnStatus.FAILED,
      }),
    );
  });

  it('fails with the turn error when recording the failure fails', async () => {
    const turnError = new Error('Provider unavailable');
    const service = await buildService(
      jest.fn().mockRejectedValue(new Error('Database unavailable')),
    );

    await expect(streamTurnWithoutClaim({ service, turnError })).rejects.toBe(
      turnError,
    );
  });
});

describe('AgentTurnStreamService streamTurn of a followed run', () => {
  const buildPublisher = () => ({
    publish: jest.fn().mockResolvedValue(undefined),
    resetStreamState: jest.fn().mockResolvedValue(undefined),
  });

  it('publishes nothing when no one follows the run', async () => {
    const eventPublisherService = buildPublisher();

    await streamReplyWithoutClaim({
      service: await buildService(jest.fn(), eventPublisherService),
    });

    expect(eventPublisherService.publish).not.toHaveBeenCalled();
  });

  it('publishes each UI chunk to the run channel, then the end of the reply', async () => {
    const eventPublisherService = buildPublisher();

    const { streamed } = await streamReplyWithoutClaim({
      service: await buildService(jest.fn(), eventPublisherService),
      streamChannelId: 'run-channel-id',
    });

    const publishedEvents = eventPublisherService.publish.mock.calls.map(
      ([{ threadId, event }]) => {
        expect(threadId).toBe('run-channel-id');

        return event;
      },
    );

    expect(
      publishedEvents
        .filter(({ type }) => type === 'stream-chunk')
        .map(({ chunk }) => chunk.type),
    ).toEqual(['start', 'text-start', 'text-delta', 'text-end', 'finish']);
    expect(publishedEvents[publishedEvents.length - 1]).toEqual({
      type: 'message-persisted',
      messageId: streamed.assistantMessageId,
    });
  });

  it('ends the run channel with the error of a failed run', async () => {
    const eventPublisherService = buildPublisher();
    const turnError = new Error('Provider unavailable');

    await expect(
      streamTurnWithoutClaim({
        service: await buildService(
          jest.fn().mockResolvedValue(true),
          eventPublisherService,
        ),
        turnError,
        streamChannelId: 'run-channel-id',
      }),
    ).rejects.toBe(turnError);

    expect(eventPublisherService.resetStreamState).toHaveBeenCalledWith(
      'run-channel-id',
    );
    expect(eventPublisherService.publish).toHaveBeenCalledWith({
      threadId: 'run-channel-id',
      workspaceId: 'workspace-id',
      event: {
        type: 'stream-error',
        code: 'STREAM_EXECUTION_FAILED',
        message: 'Provider unavailable',
      },
    });
  });
});
