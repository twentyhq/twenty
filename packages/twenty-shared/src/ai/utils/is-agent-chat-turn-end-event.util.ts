import { type AgentChatSubscriptionEvent } from '@/ai/types/AgentChatSubscriptionEvent';
import { isDefined } from '@/utils/validation/isDefined';

// one stream runs at a time on a channel, so a stream error ends the turn streaming on it
export const isAgentChatTurnEndEvent = (
  event: AgentChatSubscriptionEvent,
): boolean =>
  (event.type === 'message-persisted' && isDefined(event.turnId)) ||
  event.type === 'stream-ended' ||
  event.type === 'run-finished' ||
  event.type === 'credits-exhausted' ||
  event.type === 'stream-error';
