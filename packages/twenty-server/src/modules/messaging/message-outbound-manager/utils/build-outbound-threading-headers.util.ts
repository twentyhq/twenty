import { isNonEmptyString } from '@sniptt/guards';

import { type EmailingDomainHeader } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-header.type';

const MESSAGE_ID_PATTERN = /^<[^<>\s@]+@[^<>\s@]+>$/;

const MAX_HEADER_NAME_AND_VALUE_LENGTH = 996;

const REFERENCES_HEADER_NAME = 'References';

const IN_REPLY_TO_HEADER_NAME = 'In-Reply-To';

const isMessageId = (value: string | undefined): value is string =>
  isNonEmptyString(value) && MESSAGE_ID_PATTERN.test(value);

const fitReferencesToHeaderLength = (messageIds: string[]): string[] => {
  const [rootMessageId, ...laterMessageIds] = messageIds;
  const keptLaterMessageIds: string[] = [];
  let headerLength = REFERENCES_HEADER_NAME.length + rootMessageId.length;

  for (const messageId of [...laterMessageIds].reverse()) {
    const nextHeaderLength = headerLength + 1 + messageId.length;

    if (nextHeaderLength > MAX_HEADER_NAME_AND_VALUE_LENGTH) {
      break;
    }

    keptLaterMessageIds.unshift(messageId);
    headerLength = nextHeaderLength;
  }

  return [rootMessageId, ...keptLaterMessageIds];
};

export const buildOutboundThreadingHeaders = ({
  threadExternalId,
  inReplyTo,
  references,
}: {
  threadExternalId: string;
  inReplyTo?: string;
  references?: string[];
}): EmailingDomainHeader[] => {
  const referencedMessageIds = [
    ...new Set(
      [threadExternalId, ...(references ?? []), inReplyTo].filter(isMessageId),
    ),
  ];

  const headers: EmailingDomainHeader[] = [];

  if (isMessageId(inReplyTo)) {
    headers.push({ name: IN_REPLY_TO_HEADER_NAME, value: inReplyTo });
  }

  if (referencedMessageIds.length > 0) {
    headers.push({
      name: REFERENCES_HEADER_NAME,
      value: fitReferencesToHeaderLength(referencedMessageIds).join(' '),
    });
  }

  return headers;
};
