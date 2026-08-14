import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

export interface InboundEmailMessageSourceInterface {
  isConfigured(): boolean;
  fetchMessage(reference: string): Promise<MessageWithParticipants>;
  cleanup(reference: string): Promise<void>;
}
