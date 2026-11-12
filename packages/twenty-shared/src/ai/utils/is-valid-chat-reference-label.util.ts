import { CHAT_REFERENCE_BODY_PATTERN } from '@/ai/constants/chat-reference-body-pattern.const';

const CHAT_REFERENCE_LABEL_REGEX = new RegExp(
  `^${CHAT_REFERENCE_BODY_PATTERN}$`,
);

export const isValidChatReferenceLabel = (label: string): boolean => {
  const [matchedLabel] = label.match(CHAT_REFERENCE_LABEL_REGEX) ?? [];

  return matchedLabel === label;
};
