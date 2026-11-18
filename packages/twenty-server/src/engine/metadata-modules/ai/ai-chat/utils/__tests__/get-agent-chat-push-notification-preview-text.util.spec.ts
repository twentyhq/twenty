import { getAgentChatPushNotificationPreviewText } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-push-notification-preview-text.util';

describe('getAgentChatPushNotificationPreviewText', () => {
  it('should replace chat references with their labels', () => {
    expect(
      getAgentChatPushNotificationPreviewText(
        'Hey [[record:workspaceMember:20202020-0000-4000-8000-000000000001:Jane Austen]], see\n[[record:company:20202020-0000-4000-8000-000000000002:Acme: Inc]] and [[skill:abc:Summarize]]',
      ),
    ).toBe('Hey @Jane Austen, see Acme: Inc and Summarize');
  });
});
