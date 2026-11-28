import { type FlatMessagingProvider } from 'src/engine/metadata-modules/flat-messaging-provider/types/flat-messaging-provider.type';

export type MessagingProviderConversationStarter = {
  messagingProvider: Pick<FlatMessagingProvider, 'id' | 'name'>;
  startConversationLogicFunctionId: string;
};
