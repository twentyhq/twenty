import { v4 } from 'uuid';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';

describe('Agent chat stream state', () => {
  let eventPublisherService: AgentChatEventPublisherService;

  const workspaceId = v4();

  const publishChunk = ({
    threadId,
    text,
  }: {
    threadId: string;
    text: string;
  }) =>
    eventPublisherService.publish({
      threadId,
      workspaceId,
      event: { type: 'stream-chunk', chunk: { type: 'text-delta', text } },
    });

  beforeAll(() => {
    eventPublisherService =
      getAppProviderByClassName<AgentChatEventPublisherService>(
        'AgentChatEventPublisherService',
      );
  });

  it('resets the chunks of the stream that failed', async () => {
    const threadId = v4();
    const streamId = v4();

    await eventPublisherService.startStreamState({ threadId, streamId });
    await publishChunk({ threadId, text: 'partial' });

    await eventPublisherService.resetOwnedStreamState({ threadId, streamId });

    const { chunks } =
      await eventPublisherService.getAccumulatedChunks(threadId);

    expect(chunks).toEqual([]);
  });

  it('keeps the chunks of a stream that started after a dead one was released', async () => {
    const threadId = v4();
    const deadStreamId = v4();
    const nextStreamId = v4();

    await eventPublisherService.startStreamState({
      threadId,
      streamId: deadStreamId,
    });
    await publishChunk({ threadId, text: 'dead' });
    await eventPublisherService.resetOwnedStreamState({
      threadId,
      streamId: deadStreamId,
    });

    await eventPublisherService.startStreamState({
      threadId,
      streamId: nextStreamId,
    });
    await publishChunk({ threadId, text: 'next' });

    await eventPublisherService.resetOwnedStreamState({
      threadId,
      streamId: deadStreamId,
    });

    const { chunks, maxSeq } =
      await eventPublisherService.getAccumulatedChunks(threadId);

    expect(chunks).toEqual([{ type: 'text-delta', text: 'next' }]);
    expect(maxSeq).toBe(1);
  });
});
