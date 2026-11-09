import { type MessagingProviderConversationStyle } from '@/application/messagingProviderConversationStyleType';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type MessagingProviderManifest = SyncableEntityOptions & {
  name: string;
  displayName: string;
  connectionProvider: SyncableEntityOptions;
  sendMessageLogicFunction?: SyncableEntityOptions;
  conversationStyle?: MessagingProviderConversationStyle;
};
