import { isDefined } from 'twenty-shared/utils';

import { type MessageHeader } from 'src/modules/messaging/message-import-manager/types/message';

const MESSAGE_ID_PATTERN = /<[^<>\s]+>/g;

const extractMessageIdsFromHeader = (
  messageHeaders: MessageHeader[],
  headerName: string,
): string[] =>
  messageHeaders
    .filter((header) => header.name.toLowerCase() === headerName)
    .flatMap((header) => header.value.match(MESSAGE_ID_PATTERN) ?? []);

export const extractReferencedMessageIds = (
  messageHeaders: MessageHeader[] | undefined,
): string[] => {
  if (!isDefined(messageHeaders)) {
    return [];
  }

  return [
    ...new Set([
      ...extractMessageIdsFromHeader(messageHeaders, 'references'),
      ...extractMessageIdsFromHeader(messageHeaders, 'in-reply-to'),
    ]),
  ];
};
