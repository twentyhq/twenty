import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';

export type PersistSentMessageInput = {
  sendResult: SendMessageResult;
  subject: string;
  body: string;
  recipients: { to: string[]; cc: string[]; bcc: string[] };
  connectedAccount: Pick<ConnectedAccountEntity, 'id' | 'handle'>;
  messageChannelId: string;
  inReplyTo?: string;
  workspaceId: string;
};
