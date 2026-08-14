import { isNonEmptyString } from '@sniptt/guards';

import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

// Providers rebuild their own resource identifier when a message moves between
// folders, while the RFC 5322 header id travels with the message, so the channel
// association keys on the header id whenever the provider exposes one.
export const resolveMessageExternalId = (
  message: MessageWithParticipants,
): string =>
  isNonEmptyString(message.headerMessageId)
    ? message.headerMessageId
    : message.externalId;
