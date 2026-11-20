import { getAgentChatPreviewPlainText } from '@/ai/utils/get-agent-chat-preview-plain-text.util';
import { formatRecordReference } from '@/ai/utils/format-record-reference.util';

describe('getAgentChatPreviewPlainText', () => {
  it('uses the configured assistant label and keeps literal punctuation', () => {
    const displayName = 'Scout [team] *helper* `Ada` 100%';
    const reference = formatRecordReference({
      objectNameSingular: 'agentChatAssistant',
      recordId: 'agentChatAssistant',
      displayName: 'Ada',
    });

    expect(
      getAgentChatPreviewPlainText({
        markdown: `Ask ${reference} **today**`,
        assistantDisplayName: displayName,
      }),
    ).toBe(`Ask @${displayName} today`);
  });

  it('keeps historical prose and other structured records unchanged after a rename', () => {
    const markdown =
      '@Ada asked [[record:company:20202020-a305-41e7-8c72-ba44072a4c58:Ada]] and [[record:agentChatAssistant:agentChatAssistant:Ada]]';

    expect(
      getAgentChatPreviewPlainText({ markdown, assistantDisplayName: 'Scout' }),
    ).toBe('@Ada asked Ada and @Scout');
  });

  it('drops a reference cut short at the end of the text', () => {
    expect(
      getAgentChatPreviewPlainText({
        markdown:
          'Ask [[record:workspaceMember:20202020-0000-4000-8000-000000000001:Jane Austen]] about [[record:company:20202020-0000-4000-8000-0000',
        assistantDisplayName: 'Scout',
      }),
    ).toBe('Ask Jane Austen about');
  });
});
