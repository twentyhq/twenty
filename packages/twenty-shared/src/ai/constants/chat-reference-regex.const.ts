import { CHAT_REFERENCE_BODY_PATTERN } from '@/ai/constants/chat-reference-body-pattern.const';

export const CHAT_REFERENCE_REGEX = new RegExp(
  `\\[\\[(${CHAT_REFERENCE_BODY_PATTERN})\\]\\]`,
  'g',
);
