import { type SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';

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
  };
};
