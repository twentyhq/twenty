import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';

import { createAgentChatLiveEventFilter } from 'src/engine/metadata-modules/ai/ai-chat/utils/create-agent-chat-live-event-filter.util';

const EMPTY_CHUNK = { type: 'message-metadata', messageMetadata: {} };

const toChunkEvent = (
  chunk: Record<string, unknown>,
): AgentChatSubscriptionEvent => ({ type: 'stream-chunk', chunk, seq: 1 });

describe('createAgentChatLiveEventFilter', () => {
  it('shows only the text of a reply streamed for another member', async () => {
    const filterVisibleEvent = await createAgentChatLiveEventFilter({
      isStreamingTurnHidden: async () => true,
    });
    const textChunk = toChunkEvent({
      type: 'text-delta',
      id: 'text-1',
      delta: 'Acme renews in May',
    });

    expect(
      await filterVisibleEvent(
        toChunkEvent({
          type: 'tool-output-available',
          toolCallId: 'call-1',
          output: { email: 'ceo@acme.com' },
        }),
      ),
    ).toEqual(toChunkEvent(EMPTY_CHUNK));
    expect(await filterVisibleEvent(textChunk)).toEqual(textChunk);
    expect(await filterVisibleEvent({ type: 'queue-updated' })).toEqual({
      type: 'queue-updated',
    });
  });

  it('checks again who opened the turn when a new reply starts', async () => {
    const isStreamingTurnHidden = jest
      .fn<Promise<boolean>, []>()
      .mockResolvedValue(false);
    const filterVisibleEvent = await createAgentChatLiveEventFilter({
      isStreamingTurnHidden,
    });
    const reasoningChunk = toChunkEvent({
      type: 'reasoning-delta',
      id: 'reasoning-1',
      delta: 'Their notes',
    });

    expect(await filterVisibleEvent(reasoningChunk)).toEqual(reasoningChunk);

    isStreamingTurnHidden.mockResolvedValue(true);
    await filterVisibleEvent(toChunkEvent({ type: 'start' }));

    expect(await filterVisibleEvent(reasoningChunk)).toEqual(
      toChunkEvent(EMPTY_CHUNK),
    );
    expect(isStreamingTurnHidden).toHaveBeenCalledTimes(2);
  });
});
