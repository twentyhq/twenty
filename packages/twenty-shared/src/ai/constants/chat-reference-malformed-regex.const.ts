import { CHAT_REFERENCE_BODY_PATTERN } from '@/ai/constants/chat-reference-body-pattern.const';

export const CHAT_REFERENCE_MALFORMED_REGEX = new RegExp(
  `\\[\\[(?:record|records|object|field|view|role|app):(${CHAT_REFERENCE_BODY_PATTERN})\\]\\]`,
  'g',
);
