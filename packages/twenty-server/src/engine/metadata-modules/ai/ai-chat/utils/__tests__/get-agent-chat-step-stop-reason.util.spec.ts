import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { getAgentChatStepStopReason } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-step-stop-reason.util';

describe('getAgentChatStepStopReason', () => {
  it('stops a paid turn once its step exhausts the allowance', () => {
    expect(
      getAgentChatStepStopReason({
        operationType: UsageOperationType.AI_CHAT_TOKEN,
        exhaustedKind: 'allowance',
      }),
    ).toBe('creditsExhausted');
  });

  it('pauses an included turn once its step crosses the fair-use ceiling', () => {
    expect(
      getAgentChatStepStopReason({
        operationType: UsageOperationType.AI_CHAT_INCLUDED,
        exhaustedKind: 'limit',
      }),
    ).toBe('includedChatPaused');
  });

  it.each([
    [
      'a paid turn under a customer limit',
      UsageOperationType.AI_CHAT_TOKEN,
      'limit',
    ],
    [
      'an included turn with the allowance spent',
      UsageOperationType.AI_CHAT_INCLUDED,
      'allowance',
    ],
    ['a paid turn with room left', UsageOperationType.AI_CHAT_TOKEN, null],
    [
      'an included turn under the ceiling',
      UsageOperationType.AI_CHAT_INCLUDED,
      null,
    ],
  ] as const)('keeps %s running', (_, operationType, exhaustedKind) => {
    expect(
      getAgentChatStepStopReason({ operationType, exhaustedKind }),
    ).toBeNull();
  });
});
