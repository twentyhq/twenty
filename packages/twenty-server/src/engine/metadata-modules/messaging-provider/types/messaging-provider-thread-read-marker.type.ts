import { type FlatMessagingProvider } from 'src/engine/metadata-modules/flat-messaging-provider/types/flat-messaging-provider.type';

export type MessagingProviderThreadReadMarker = {
  messagingProvider: Pick<FlatMessagingProvider, 'id' | 'name'>;
  markThreadAsReadLogicFunctionId: string;
};
