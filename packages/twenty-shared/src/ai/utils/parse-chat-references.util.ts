import { CHAT_REFERENCE_REGEX } from '@/ai/constants/chat-reference-regex.const';
import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';
import { parseChatReferenceBody } from '@/ai/utils/parse-chat-reference-body.util';
import { isDefined } from '@/utils/validation/isDefined';

export const parseChatReferences = (text: string): ChatReferenceMatch[] => {
  if (!text.includes('[[')) {
    return [];
  }

  return [...text.matchAll(CHAT_REFERENCE_REGEX)].flatMap((match) => {
    const reference = parseChatReferenceBody(match[1] ?? '');

    return isDefined(reference)
      ? [{ ...reference, fullMatch: match[0], index: match.index }]
      : [];
  });
};
