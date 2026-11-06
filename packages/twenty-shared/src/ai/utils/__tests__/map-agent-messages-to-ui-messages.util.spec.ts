import { mapAgentMessagesToUIMessages } from '@/ai/utils/map-agent-messages-to-ui-messages.util';

const message = {
  id: 'message-id',
  threadId: 'thread-id',
  turnId: 'turn-id',
  role: 'assistant',
  status: 'sent',
  createdAt: '2026-11-06T10:00:00.000Z',
  parts: [{ type: 'text', orderIndex: 0, textContent: 'Ada wrote this.' }],
};

describe('mapAgentMessagesToUIMessages author provenance', () => {
  it('carries server classification without rewriting historical prose', () => {
    const [mapped] = mapAgentMessagesToUIMessages([
      { ...message, agentId: null, isBuiltInAssistant: true },
    ]);

    expect(mapped?.metadata).toMatchObject({
      turnId: 'turn-id',
      agentId: null,
      isBuiltInAssistant: true,
    });
    expect(mapped?.parts).toEqual([{ type: 'text', text: 'Ada wrote this.' }]);
  });

  it('preserves application, human and named-agent provenance', () => {
    const [mapped] = mapAgentMessagesToUIMessages([
      {
        ...message,
        agentId: 'custom-agent-id',
        senderApplicationId: 'application-id',
        senderWorkspaceMemberId: 'member-id',
        isBuiltInAssistant: false,
      },
    ]);

    expect(mapped?.metadata).toMatchObject({
      agentId: 'custom-agent-id',
      senderApplicationId: 'application-id',
      senderWorkspaceMemberId: 'member-id',
      isBuiltInAssistant: false,
    });
  });
});
