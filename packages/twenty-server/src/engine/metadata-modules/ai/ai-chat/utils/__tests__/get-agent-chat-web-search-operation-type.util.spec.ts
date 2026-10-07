import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { getAgentChatWebSearchOperationType } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-web-search-operation-type.util';

describe('getAgentChatWebSearchOperationType', () => {
  it('bills native web search in a paid turn as web search', () => {
    expect(
      getAgentChatWebSearchOperationType(UsageOperationType.AI_CHAT_TOKEN),
    ).toBe(UsageOperationType.WEB_SEARCH);
  });

  it('records native web search in an included turn as included chat, out of the allowance', () => {
    expect(
      getAgentChatWebSearchOperationType(UsageOperationType.AI_CHAT_INCLUDED),
    ).toBe(UsageOperationType.AI_CHAT_INCLUDED);
  });
});
