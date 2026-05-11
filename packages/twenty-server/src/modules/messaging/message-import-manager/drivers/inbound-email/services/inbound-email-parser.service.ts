import { Injectable } from '@nestjs/common';

import PostalMime, { type Email as ParsedEmail } from 'postal-mime';

import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { type ParsedInboundMessage } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/types/parsed-inbound-message.type';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { extractParticipantsFromParsedEmail } from 'src/modules/messaging/message-import-manager/utils/extract-participants-from-parsed-email.util';
import { extractThreadIdFromParsedEmail } from 'src/modules/messaging/message-import-manager/utils/extract-thread-id-from-parsed-email.util';
import { sanitizeString } from 'src/modules/messaging/message-import-manager/utils/sanitize-string.util';

@Injectable()
export class InboundEmailParserService {
  async parse(
    rawMessage: Buffer,
    s3Key: string,
  ): Promise<ParsedInboundMessage> {
    const parsedEmail = await PostalMime.parse(rawMessage);
    const message = this.buildMessage(parsedEmail, s3Key);

    return { parsed: parsedEmail, message };
  }

  private buildMessage(
    parsedEmail: ParsedEmail,
    s3Key: string,
  ): MessageWithParticipants {
    return {
      externalId: `inbound-email:${s3Key}`,
      messageThreadExternalId: extractThreadIdFromParsedEmail(parsedEmail),
      headerMessageId: parsedEmail.messageId?.trim() || `inbound-${s3Key}`,
      subject: sanitizeString(parsedEmail.subject || ''),
      text: sanitizeString(parsedEmail.text || ''),
      receivedAt: parsedEmail.date ? new Date(parsedEmail.date) : new Date(),
      direction: MessageDirection.INCOMING,
      attachments: [],
      participants: extractParticipantsFromParsedEmail(parsedEmail),
    };
  }
}
