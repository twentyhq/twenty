import { type UIDataTypes, type UIMessage, type UITools } from 'ai';
import { isDefined } from 'twenty-shared/utils';

type ChatUIMessage = UIMessage<unknown, UIDataTypes, UITools>;
type ChatUIMessagePart = ChatUIMessage['parts'][number];

const isToolPart = (
  part: ChatUIMessagePart,
): part is ChatUIMessagePart & {
  type: `tool-${string}`;
  output?: unknown;
  errorText?: string;
} => part.type.startsWith('tool-');

const serializeToolValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const toolPartToTextPart = (
  part: ChatUIMessagePart & {
    type: `tool-${string}`;
    output?: unknown;
    errorText?: string;
  },
): ChatUIMessagePart | null => {
  const toolName = part.type.replace(/^tool-/, '');

  if (isDefined(part.output)) {
    return {
      type: 'text',
      text: `Tool result (${toolName}):\n${serializeToolValue(part.output)}`,
    };
  }

  if (isDefined(part.errorText) && part.errorText !== '') {
    return {
      type: 'text',
      text: `Tool error (${toolName}):\n${part.errorText}`,
    };
  }

  return null;
};

export const sanitizeOpenAiZdrMessageHistory = (
  messages: ChatUIMessage[],
): ChatUIMessage[] => {
  return messages
    .map((message) => {
      const parts = message.parts
        .map((part) => (isToolPart(part) ? toolPartToTextPart(part) : part))
        .filter(isDefined);

      return {
        ...message,
        parts,
      };
    })
    .filter((message) => message.parts.length > 0);
};
