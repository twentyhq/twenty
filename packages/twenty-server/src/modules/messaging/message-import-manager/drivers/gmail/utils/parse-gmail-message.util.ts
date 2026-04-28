import assert from 'assert';

import { type gmail_v1 } from 'googleapis';

import { getAttachmentData } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/get-attachment-data.util';
import { getBodyData } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/get-body-data.util';
import { getPropertyFromHeaders } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/get-property-from-headers.util';
import { createHtmlToTextConverter } from 'src/modules/messaging/message-import-manager/utils/create-html-to-text-converter.util';
import { safeParseEmailAddressAddress } from 'src/modules/messaging/message-import-manager/utils/safe-parse.util';

export const parseGmailMessage = (message: gmail_v1.Schema$Message) => {
  const subject = getPropertyFromHeaders(message, 'Subject');
  const rawFrom = getPropertyFromHeaders(message, 'From');
  const rawTo = getPropertyFromHeaders(message, 'To');
  const rawDeliveredTo = getPropertyFromHeaders(message, 'Delivered-To');
  const rawCc = getPropertyFromHeaders(message, 'Cc');
  const rawBcc = getPropertyFromHeaders(message, 'Bcc');
  const messageId = getPropertyFromHeaders(message, 'Message-ID');
  const id = message.id;
  const threadId = message.threadId;
  const historyId = message.historyId;
  const internalDate = message.internalDate;
  const labelIds = message.labelIds ?? [];

  assert(id, 'ID is missing');
  assert(historyId, 'History-ID is missing');
  assert(internalDate, 'Internal date is missing');

  const bodyResult = getBodyData(message);
  const decodedBody = bodyResult
    ? Buffer.from(bodyResult.data, 'base64').toString()
    : '';

  const text = bodyResult?.isHtml
    ? createHtmlToTextConverter()(decodedBody)
    : decodedBody;

  const attachments = getAttachmentData(message);

  return {
    id,
    headerMessageId: messageId,
    threadId,
    historyId,
    internalDate,
    subject,
    from: rawFrom ? safeParseEmailAddressAddress(rawFrom) : undefined,
    deliveredTo: rawDeliveredTo
      ? safeParseEmailAddressAddress(rawDeliveredTo)
      : undefined,
    to: rawTo ? safeParseEmailAddressAddress(rawTo) : undefined,
    cc: rawCc ? safeParseEmailAddressAddress(rawCc) : undefined,
    bcc: rawBcc ? safeParseEmailAddressAddress(rawBcc) : undefined,
    text,
    attachments,
    labelIds,
  };
};
