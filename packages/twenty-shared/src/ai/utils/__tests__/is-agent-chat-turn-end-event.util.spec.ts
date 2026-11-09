import { type AgentChatSubscriptionEvent } from '@/ai/types/AgentChatSubscriptionEvent';
import { isAgentChatTurnEndEvent } from '@/ai/utils/is-agent-chat-turn-end-event.util';

const TURN_END_EVENTS: AgentChatSubscriptionEvent[] = [
  { type: 'message-persisted', messageId: 'message-id', turnId: 'turn-id' },
  { type: 'stream-ended' },
  { type: 'run-finished', turnId: 'turn-id' },
  { type: 'credits-exhausted' },
  { type: 'stream-error', code: 'STREAM_ERROR', message: 'Failed' },
];

describe('isAgentChatTurnEndEvent', () => {
  it.each(TURN_END_EVENTS)('ends the turn on $type', (event) => {
    expect(isAgentChatTurnEndEvent(event)).toBe(true);
  });

  it('does not end a turn on a message a member saved, which has no turn', () => {
    expect(
      isAgentChatTurnEndEvent({
        type: 'message-persisted',
        messageId: 'message-id',
      }),
    ).toBe(false);
  });

  it('does not end a turn on a chunk or a keepalive', () => {
    expect(isAgentChatTurnEndEvent({ type: 'keepalive' })).toBe(false);
    expect(
      isAgentChatTurnEndEvent({
        type: 'stream-chunk',
        chunk: { type: 'text-delta' },
      }),
    ).toBe(false);
  });
});
