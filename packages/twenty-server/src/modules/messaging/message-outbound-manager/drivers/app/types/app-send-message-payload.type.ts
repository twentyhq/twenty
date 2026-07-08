import { type SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';

export type AppSendMessagePayload = {
  input: Omit<SendMessageInput, 'attachments'> & {
    attachments?: {
      filename: string;
      contentType: string;
      content: string;
    }[];
  };
  connectedAccount: {
    id: string;
    handle: string;
    accessToken: string | null;
  };
};
