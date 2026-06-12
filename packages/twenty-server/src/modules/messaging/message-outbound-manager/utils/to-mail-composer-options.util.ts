import { type SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';
import { isDefined } from 'twenty-shared/utils';

export const toMailComposerOptions = (
  from: string,
  sendMessageInput: SendMessageInput,
) => {
  return {
    from,
    to: sendMessageInput.to,
    cc: sendMessageInput.cc,
    bcc: sendMessageInput.bcc,
    subject: sendMessageInput.subject,
    text: sendMessageInput.body,
    html: sendMessageInput.html,
    ...(sendMessageInput.attachments && sendMessageInput.attachments.length > 0
      ? {
          attachments: sendMessageInput.attachments.map((attachment) => ({
            filename: attachment.filename,
            content: attachment.content,
            contentType: attachment.contentType,
          })),
        }
      : {}),
    ...(sendMessageInput.inReplyTo
      ? {
          inReplyTo: sendMessageInput.inReplyTo,
          references:
            isDefined(sendMessageInput.references) &&
            sendMessageInput.references.length > 0
              ? sendMessageInput.references
              : sendMessageInput.inReplyTo,
        }
      : {}),
  };
};
