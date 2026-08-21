import { type ComposedEmail } from 'src/engine/core-modules/tool/tools/email-tool/types/composed-email.type';
import { type SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';

export const toSendMessageInput = (data: ComposedEmail): SendMessageInput => ({
  fromHandle: data.fromHandle,
  to: data.recipients.to,
  cc: data.recipients.cc.length > 0 ? data.recipients.cc : undefined,
  bcc: data.recipients.bcc.length > 0 ? data.recipients.bcc : undefined,
  subject: data.sanitizedSubject,
  body: data.plainTextBody,
  html: data.sanitizedHtmlBody,
  attachments: data.attachments,
  inReplyTo: data.inReplyTo,
  threadExternalId: data.threadExternalId,
  references: data.references,
});
