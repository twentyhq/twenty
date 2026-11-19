import { getAgentChatPreviewPlainText } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-preview-plain-text.util';

describe('getAgentChatPreviewPlainText', () => {
  it('should replace chat references with their labels', () => {
    expect(
      getAgentChatPreviewPlainText(
        'Hey [[record:workspaceMember:20202020-0000-4000-8000-000000000001:Jane Austen]], see\n[[record:company:20202020-0000-4000-8000-000000000002:Acme: Inc]] and [[skill:abc:Summarize]]',
      ),
    ).toBe('Hey @Jane Austen, see Acme: Inc and Summarize');
  });

  it('should drop a reference cut short at the end of the text', () => {
    expect(
      getAgentChatPreviewPlainText(
        'Ask [[record:workspaceMember:20202020-0000-4000-8000-000000000001:Jane Austen]] about [[record:company:20202020-0000-4000-8000-0000',
      ),
    ).toBe('Ask @Jane Austen about');
  });
});
