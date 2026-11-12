import { isNonEmptyString } from '@sniptt/guards';
import { type gmail_v1 as gmailV1 } from 'googleapis';
import { isDefined } from 'twenty-shared/utils';

import { GMAIL_MAX_MESSAGE_PARTS_TO_PROCESS } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/gmail-max-message-parts-to-process.constant';
import { type GmailAttachmentData } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-attachment-data.type';
import { isGmailInlineMessagePart } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-inline-message-part.util';

export const getAttachmentData = (
  message: gmailV1.Schema$Message,
): GmailAttachmentData[] => {
  const payload = message.payload;

  if (!isDefined(payload)) {
    return [];
  }

  const attachments: GmailAttachmentData[] = [];
  const parts: gmailV1.Schema$MessagePart[] = [payload];

  for (
    let partIndex = 0;
    parts.length !== 0 && partIndex < GMAIL_MAX_MESSAGE_PARTS_TO_PROCESS;
    partIndex++
  ) {
    const part = parts.shift()!;

    if (isDefined(part.parts)) {
      parts.unshift(...part.parts);
    }

    const filename = part.filename;
    const attachmentId = part.body?.attachmentId;
    const partId = part.partId;

    if (
      !isNonEmptyString(filename) ||
      !isNonEmptyString(attachmentId) ||
      !isDefined(partId)
    ) {
      continue;
    }

    attachments.push({
      externalId: partId,
      filename,
      size: part.body?.size ?? 0,
      contentType: part.mimeType ?? '',
      isInline: isGmailInlineMessagePart(part),
      attachmentId,
    });
  }

  return attachments;
};
