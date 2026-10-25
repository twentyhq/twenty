import { isDefined } from 'twenty-shared/utils';

import { type FlatConnectionProviderMaps } from 'src/engine/metadata-modules/flat-connection-provider/types/flat-connection-provider-maps.type';
import { type FlatMessagingProviderMaps } from 'src/engine/metadata-modules/flat-messaging-provider/types/flat-messaging-provider-maps.type';
import { type FlatMessagingProvider } from 'src/engine/metadata-modules/flat-messaging-provider/types/flat-messaging-provider.type';

// a channel sends with its own account, so its messaging provider must speak through that account's connection provider
export const findMessagingProviderOnConnectionProvider = ({
  flatMessagingProviderMaps,
  flatConnectionProviderMaps,
  messagingProviderUniversalIdentifier,
  connectionProviderId,
}: {
  flatMessagingProviderMaps: FlatMessagingProviderMaps;
  flatConnectionProviderMaps: FlatConnectionProviderMaps;
  messagingProviderUniversalIdentifier: string | null;
  connectionProviderId: string | null;
}): FlatMessagingProvider | undefined => {
  const messagingProvider = isDefined(messagingProviderUniversalIdentifier)
    ? flatMessagingProviderMaps.byUniversalIdentifier[
        messagingProviderUniversalIdentifier
      ]
    : undefined;

  if (!isDefined(messagingProvider)) {
    return undefined;
  }

  const connectionProvider =
    flatConnectionProviderMaps.byUniversalIdentifier[
      messagingProvider.connectionProviderUniversalIdentifier
    ];

  return isDefined(connectionProvider) &&
    connectionProvider.id === connectionProviderId
    ? messagingProvider
    : undefined;
};
