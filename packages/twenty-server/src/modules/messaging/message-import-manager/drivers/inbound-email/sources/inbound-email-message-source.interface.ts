import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message.type';

export type InboundEmailMessageSourceInterface = {
  isConfigured(): boolean;
  fetchMessage(reference: string): Promise<MessageWithParticipants>;
  cleanup(reference: string): Promise<void>;
};
