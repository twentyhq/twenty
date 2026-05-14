import { type Email as ParsedEmail } from 'postal-mime';

import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

export type ParsedInboundMessage = {
  parsed: ParsedEmail;
  message: MessageWithParticipants;
};
