import { type UsageRefusal } from 'src/engine/core-modules/billing/types/usage-refusal.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { isAgentChatIncludedTurnRefused } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-agent-chat-included-turn-refused.util';

const REFUSAL: UsageRefusal = {
  kind: 'subscriptionInactive',
  reason: 'WORKSPACE_SUSPENDED',
};

describe('isAgentChatIncludedTurnRefused', () => {
  it('refuses an included turn the plan refused', () => {
    expect(
      isAgentChatIncludedTurnRefused({
        operationType: UsageOperationType.AI_CHAT_INCLUDED,
        refusal: REFUSAL,
      }),
    ).toBe(true);
  });

  it('admits an included turn the plan admitted', () => {
    expect(
      isAgentChatIncludedTurnRefused({
        operationType: UsageOperationType.AI_CHAT_INCLUDED,
        refusal: null,
      }),
    ).toBe(false);
  });

  it('leaves a refused paid turn to stop at its first step', () => {
    expect(
      isAgentChatIncludedTurnRefused({
        operationType: UsageOperationType.AI_CHAT_TOKEN,
        refusal: REFUSAL,
      }),
    ).toBe(false);
  });
});
