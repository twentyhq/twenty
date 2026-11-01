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

const buildService = async ({
  finish,
  eventPublisherService = {},
}: {
  finish: jest.Mock;
  eventPublisherService?: Record<string, jest.Mock>;
}) => {
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

const streamPartsWithoutClaim = ({
  service,
  parts = REPLY_PARTS,
  streamChannelId,
}: {
  service: AgentTurnStreamService;
  parts?: Record<string, unknown>[];
  streamChannelId?: string;
}) =>
  service.streamTurn({
    workspaceId: 'workspace-id',
    claim: null,
    streamChannelId,
    turnId: 'turn-id',
    startTurn: async () => ({
      source: {
        modelConfig: {
          contextWindowTokens: 1000,
          inputCostPerMillionTokens: 1,
          outputCostPerMillionTokens: 1,
        } as never,
        parts: new ReadableStream({
          start(controller) {
            parts.forEach((part) => controller.enqueue(part as never));
            controller.close();
          },
        }),
      },
    }),
    completeTurn: async () => ({ modelId: 'model-id', stopReason: null }),
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
        service: await buildService({ finish }),
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
        service: await buildService({ finish }),
        turnError,
      }),
    ).rejects.toBe(turnError);

    expectFailureRecordedOnce(finish);
  });
});

describe('AgentTurnStreamService streamTurn of a followed run', () => {
  const buildPublisher = () => ({
    publish: jest.fn().mockResolvedValue(undefined),
    resetStreamState: jest.fn().mockResolvedValue(undefined),
  });

  it('publishes nothing when no one follows the run', async () => {
    const eventPublisherService = buildPublisher();

    await streamPartsWithoutClaim({
      service: await buildService({ finish: jest.fn(), eventPublisherService }),
    });

    expect(eventPublisherService.publish).not.toHaveBeenCalled();
  });

  it('publishes each UI chunk to the run channel, then the end of the reply', async () => {
    const eventPublisherService = buildPublisher();

    const { streamed } = await streamPartsWithoutClaim({
      service: await buildService({ finish: jest.fn(), eventPublisherService }),
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

  it('keeps a finished run completed when its end event cannot be sent', async () => {
    const finish = jest.fn().mockResolvedValue(true);
    const eventPublisherService = {
      publish: jest.fn(async ({ event }: { event: { type: string } }) => {
        if (event.type === 'message-persisted') {
          throw new Error('Redis unavailable');
        }
      }),
      resetStreamState: jest.fn().mockResolvedValue(undefined),
    };

    await expect(
      streamPartsWithoutClaim({
        service: await buildService({ finish, eventPublisherService }),
        streamChannelId: 'run-channel-id',
      }),
    ).resolves.toMatchObject({ finish: { outcome: { kind: 'completed' } } });

    expect(finish).toHaveBeenCalledTimes(1);
    expect(finish).toHaveBeenCalledWith(
      expect.objectContaining({
        turnId: 'turn-id',
        status: AgentTurnStatus.COMPLETED,
      }),
    );
  });

  it('ends the run channel with the error of a failed run', async () => {
    const eventPublisherService = buildPublisher();
    const finish = jest.fn().mockResolvedValue(true);
    const turnError = new Error('Provider unavailable');

    await expect(
      streamTurnWithoutClaim({
        service: await buildService({ finish, eventPublisherService }),
        turnError,
        streamChannelId: 'run-channel-id',
      }),
    ).rejects.toBe(turnError);

    expectFailureRecordedOnce(finish);
    expect(eventPublisherService.resetStreamState).toHaveBeenCalledTimes(1);
    expect(eventPublisherService.resetStreamState).toHaveBeenCalledWith(
      'run-channel-id',
    );
    expect(eventPublisherService.publish).toHaveBeenCalledTimes(1);
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

describe('AgentTurnStreamService streamTurn usage', () => {
  it('counts the usage a model reports with an error finish reason', async () => {
    const { streamed } = await streamPartsWithoutClaim({
      service: await buildService({
        finish: jest.fn().mockResolvedValue(true),
      }),
      parts: [
        { type: 'start' },
        { type: 'start-step' },
        {
          type: 'finish-step',
          finishReason: 'error',
          usage: { inputTokens: 120, outputTokens: 8 },
        },
        { type: 'start-step' },
        {
          type: 'finish-step',
          finishReason: 'error',
          usage: { inputTokens: undefined, outputTokens: undefined },
        },
        { type: 'finish', finishReason: 'error', totalUsage: {} },
      ],
    });

    expect(streamed.usage).toMatchObject({
      inputTokens: 120,
      outputTokens: 8,
      conversationSize: 120,
    });
  });
});

describe('AgentTurnStreamService streamTurn of a claimed turn', () => {
  it('keeps a finished turn completed when its end event cannot be sent', async () => {
    const finish = jest.fn().mockResolvedValue(true);
    const publish = jest.fn(async ({ event }: { event: { type: string } }) => {
      if (event.type === 'message-persisted') {
        throw new Error('Redis unavailable');
      }
    });

    const service = await buildService({
      finish,
      eventPublisherService: { publish },
    });

    await expect(
      service.streamTurn({
        workspaceId: 'workspace-id',
        claim: {
          workspaceId: 'workspace-id',
          threadId: 'thread-id',
          streamId: 'stream-id',
        },
        turnId: 'turn-id',
        startTurn: async () => ({
          source: {
            modelConfig: { contextWindowTokens: 1000 } as never,
            parts: new ReadableStream({
              start(controller) {
                [
                  { type: 'start' },
                  { type: 'finish', finishReason: 'stop', totalUsage: {} },
                ].forEach((part) => controller.enqueue(part as never));
                controller.close();
              },
            }),
          },
        }),
        completeTurn: async () => ({ modelId: 'model-id', stopReason: null }),
        isBackgroundRun: true,
      }),
    ).resolves.toMatchObject({ finish: { outcome: { kind: 'completed' } } });

    expect(finish).toHaveBeenCalledTimes(1);
    expect(finish).toHaveBeenCalledWith(
      expect.objectContaining({
        turnId: 'turn-id',
        status: AgentTurnStatus.COMPLETED,
      }),
    );
  });
});
