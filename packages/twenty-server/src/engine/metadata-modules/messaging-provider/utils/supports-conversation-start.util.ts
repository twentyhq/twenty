import { type FlatMessagingProvider } from 'src/engine/metadata-modules/flat-messaging-provider/types/flat-messaging-provider.type';

export const supportsConversationStart = (
  messagingProvider: Pick<FlatMessagingProvider, 'conversationStyle'>,
) => messagingProvider.conversationStyle !== 'email';
