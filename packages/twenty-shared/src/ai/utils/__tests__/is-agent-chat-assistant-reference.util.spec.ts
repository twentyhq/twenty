import { isAgentChatAssistantReference } from '@/ai/utils/is-agent-chat-assistant-reference.util';

describe('isAgentChatAssistantReference', () => {
  it('recognizes only a record segment with the canonical assistant identity', () => {
    expect(
      isAgentChatAssistantReference({
        kind: 'record',
        objectNameSingular: 'agentChatAssistant',
        recordId: 'agentChatAssistant',
      }),
    ).toBe(true);
    expect(
      isAgentChatAssistantReference({
        kind: 'object',
        objectNameSingular: 'agentChatAssistant',
        recordId: 'agentChatAssistant',
      }),
    ).toBe(false);
    expect(
      isAgentChatAssistantReference({
        kind: 'record',
        objectNameSingular: 'workspaceMember',
        recordId: 'agentChatAssistant',
      }),
    ).toBe(false);
  });
});
