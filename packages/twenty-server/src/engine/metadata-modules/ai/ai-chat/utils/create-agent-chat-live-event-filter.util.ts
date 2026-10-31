import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';

import { maskStreamChunkOfTurnActedByOthers } from 'src/engine/metadata-modules/ai/ai-history/utils/mask-stream-chunk-of-turn-acted-by-others.util';

export const createAgentChatLiveEventFilter = async ({
  isStreamingTurnHidden,
}: {
  isStreamingTurnHidden: () => Promise<boolean>;
}): Promise<
  (event: AgentChatSubscriptionEvent) => Promise<AgentChatSubscriptionEvent>
> => {
  let isHidden = await isStreamingTurnHidden();

  return async (event) => {
    if (event.type !== 'stream-chunk') {
      return event;
    }

    // every reply opens with a start chunk, so the turn it streams is known by then
    if (event.chunk.type === 'start') {
      isHidden = await isStreamingTurnHidden();
    }

    if (!isHidden) {
      return event;
    }

    return { ...event, chunk: maskStreamChunkOfTurnActedByOthers(event.chunk) };
  };
};
