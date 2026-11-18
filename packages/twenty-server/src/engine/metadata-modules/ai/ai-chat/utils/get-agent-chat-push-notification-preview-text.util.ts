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

export const getAgentChatPushNotificationPreviewText = (text: string): string =>
  text
    .replace(CHAT_REFERENCE_PATTERN, (_, body: string) => {
      const segments = body.split(':');
      const [objectName, ...rest] =
        segments[0] === 'record' ? segments.slice(1) : segments;
      const label = rest.slice(1).join(':');

      return MENTIONED_OBJECT_NAMES.includes(objectName) ? `@${label}` : label;
    })
    .replace(/\s+/g, ' ')
    .trim();
