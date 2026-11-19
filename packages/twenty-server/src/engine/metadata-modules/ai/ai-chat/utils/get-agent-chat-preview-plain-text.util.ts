import {
  AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
  CHAT_REFERENCE_BODY_PATTERN,
} from 'twenty-shared/ai';

const CHAT_REFERENCE_PATTERN = new RegExp(
  `\\[\\[(${CHAT_REFERENCE_BODY_PATTERN})\\]\\]`,
  'g',
);

const MENTIONED_OBJECT_NAMES = [
  'workspaceMember',
  AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
];

const RECORD_REFERENCE_PREFIX_PATTERN = /^record:/;

const TRUNCATED_TRAILING_CHAT_REFERENCE_PATTERN = /\[\[[^\]]*$/;

const getChatReferencePreviewText = (referenceBody: string): string => {
  const [objectName, , ...labelSegments] = referenceBody
    .replace(RECORD_REFERENCE_PREFIX_PATTERN, '')
    .split(':');
  const label = labelSegments.join(':');

  return MENTIONED_OBJECT_NAMES.includes(objectName) ? `@${label}` : label;
};

export const getAgentChatPreviewPlainText = (text: string): string =>
  text
    .replace(CHAT_REFERENCE_PATTERN, (_, referenceBody: string) =>
      getChatReferencePreviewText(referenceBody),
    )
    .replace(TRUNCATED_TRAILING_CHAT_REFERENCE_PATTERN, '')
    .replace(/\s+/g, ' ')
    .trim();
