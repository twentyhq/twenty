import { type MessagingProviderConversationStyle } from '@/application/messagingProviderConversationStyleType';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type MessagingProviderManifest = SyncableEntityOptions & {
  name: string;
  displayName: string;
  connectionProviderUniversalIdentifier?: string;
  sendMessageLogicFunctionUniversalIdentifier?: string;
  markThreadAsReadLogicFunctionUniversalIdentifier?: string;
  /** @deprecated Use `connectionProviderUniversalIdentifier` instead. */
  connectionProvider?: SyncableEntityOptions;
  /** @deprecated Use `sendMessageLogicFunctionUniversalIdentifier` instead. */
  sendMessageLogicFunction?: SyncableEntityOptions;
  /** @deprecated Use `markThreadAsReadLogicFunctionUniversalIdentifier` instead. */
  markThreadAsReadLogicFunction?: SyncableEntityOptions;
  conversationStyle?: MessagingProviderConversationStyle;
};
