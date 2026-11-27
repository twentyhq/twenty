import { isString } from '@sniptt/guards';

import { escapeMarkdownForChatReference } from '@/ai/utils/escape-markdown-for-chat-reference.util';
import { getChatReferenceSegments } from '@/ai/utils/get-chat-reference-segments.util';
import { isAgentChatAssistantReference } from '@/ai/utils/is-agent-chat-assistant-reference.util';
import { getPlainTextFromMarkdown } from '@/markdown/utils/get-plain-text-from-markdown.util';

const TRUNCATED_TRAILING_CHAT_REFERENCE_PATTERN = /\[\[[^\]]*$/;

export const getAgentChatPreviewPlainText = ({
  markdown,
  assistantDisplayName,
}: {
  markdown: string;
  assistantDisplayName: string;
}): string =>
  getPlainTextFromMarkdown(
    getChatReferenceSegments(markdown)
      .map((segment) => {
        if (isString(segment)) {
          return segment;
        }

        if (isAgentChatAssistantReference(segment)) {
          return escapeMarkdownForChatReference(`@${assistantDisplayName}`);
        }

        return segment.displayName;
      })
      .join('')
      .replace(TRUNCATED_TRAILING_CHAT_REFERENCE_PATTERN, ''),
  );
