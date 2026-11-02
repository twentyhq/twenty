import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { maskStreamChunkOfTurnActedByOthers } from 'src/engine/metadata-modules/ai/ai-history/utils/mask-stream-chunk-of-turn-acted-by-others.util';

export const createAgentChatLiveEventFilter = ({
  isStreamingTurnHidden,
}: {
  isStreamingTurnHidden: () => Promise<boolean>;
}): ((
  event: AgentChatSubscriptionEvent,
) => Promise<AgentChatSubscriptionEvent>) => {
  let isHidden: Promise<boolean> | undefined;

  return async (event) => {
    if (event.type !== 'stream-chunk') {
      return event;
    }

    // read once a chunk arrives, so the channel is already subscribed and a turn starting before it is seen;
    // every reply opens with a start chunk, so the turn it streams is known by then
    if (!isDefined(isHidden) || event.chunk.type === 'start') {
      isHidden = isStreamingTurnHidden();
    }

    if (!(await isHidden)) {
      return event;
    }

    return { ...event, chunk: maskStreamChunkOfTurnActedByOthers(event.chunk) };
  };
};
