import { isDefined } from 'twenty-shared/utils';

import { type MessageHeader } from 'src/modules/messaging/message-import-manager/types/message';

const MESSAGE_ID_PATTERN = /<[^<>\s]{1,996}>/g;

const MAX_REFERENCED_MESSAGE_IDS = 20;

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

  const referencedMessageIds = [
    ...new Set([
      ...extractMessageIdsFromHeader(messageHeaders, 'references'),
      ...extractMessageIdsFromHeader(messageHeaders, 'in-reply-to'),
    ]),
  ];

  if (referencedMessageIds.length <= MAX_REFERENCED_MESSAGE_IDS) {
    return referencedMessageIds;
  }

  const [rootMessageId, ...laterMessageIds] = referencedMessageIds;

  return [
    rootMessageId,
    ...laterMessageIds.slice(-(MAX_REFERENCED_MESSAGE_IDS - 1)),
  ];
};
