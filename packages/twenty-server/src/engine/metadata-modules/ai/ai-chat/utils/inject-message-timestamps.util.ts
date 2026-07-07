import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { getValidTimeZoneOrUndefined } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-valid-time-zone-or-undefined.util';

const formatMessageTimestamp = (date: Date, timezone: string | null): string =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: getValidTimeZoneOrUndefined(timezone),
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);

const extractCreatedAt = (message: ExtendedUIMessage): Date | undefined => {
  const rawCreatedAt = message.metadata?.createdAt;

  if (!isDefined(rawCreatedAt)) {
    return undefined;
  }

  const parsedCreatedAt = new Date(rawCreatedAt);

  return isNaN(parsedCreatedAt.getTime()) ? undefined : parsedCreatedAt;
};

export const injectMessageTimestamps = (
  messages: ExtendedUIMessage[],
  timezone: string | null,
): ExtendedUIMessage[] =>
  messages.map((message) => {
    if (message.role !== 'user') {
      return message;
    }

    const createdAt = extractCreatedAt(message);

    if (!isDefined(createdAt)) {
      return message;
    }

    const timestampPart = {
      type: 'text' as const,
      text: `<message_timestamp>Sent: ${formatMessageTimestamp(createdAt, timezone)}</message_timestamp>`,
    };

    return {
      ...message,
      parts: [timestampPart, ...message.parts],
    };
  });
