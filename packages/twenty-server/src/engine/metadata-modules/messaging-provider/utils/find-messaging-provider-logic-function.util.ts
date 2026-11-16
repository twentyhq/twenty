import { isDefined } from 'twenty-shared/utils';

import { type FlatConnectionProviderMaps } from 'src/engine/metadata-modules/flat-connection-provider/types/flat-connection-provider-maps.type';
import { type FlatMessagingProviderMaps } from 'src/engine/metadata-modules/flat-messaging-provider/types/flat-messaging-provider-maps.type';
import { type FlatMessagingProvider } from 'src/engine/metadata-modules/flat-messaging-provider/types/flat-messaging-provider.type';
import { type FlatLogicFunctionMaps } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function-maps.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { findApplicationFlatLogicFunction } from 'src/engine/metadata-modules/logic-function/utils/find-application-flat-logic-function.util';
import { findMessagingProviderOnConnectionProvider } from 'src/engine/metadata-modules/messaging-provider/utils/find-messaging-provider-on-connection-provider.util';

export const findMessagingProviderLogicFunction = ({
  flatMessagingProviderMaps,
  flatConnectionProviderMaps,
  flatLogicFunctionMaps,
  messagingProviderUniversalIdentifier,
  connectionProviderId,
  getLogicFunctionUniversalIdentifier,
}: {
  flatMessagingProviderMaps: Pick<
    FlatMessagingProviderMaps,
    'byUniversalIdentifier'
  >;
  flatConnectionProviderMaps: Pick<
    FlatConnectionProviderMaps,
    'byUniversalIdentifier'
  >;
  flatLogicFunctionMaps: Pick<FlatLogicFunctionMaps, 'byUniversalIdentifier'>;
  messagingProviderUniversalIdentifier: string | null;
  connectionProviderId: string;
  getLogicFunctionUniversalIdentifier: (
    messagingProvider: FlatMessagingProvider,
  ) => string | null;
}): {
  messagingProvider: FlatMessagingProvider | undefined;
  logicFunction: FlatLogicFunction | undefined;
} => {
  const messagingProvider = findMessagingProviderOnConnectionProvider({
    flatMessagingProviderMaps,
    flatConnectionProviderMaps,
    messagingProviderUniversalIdentifier,
    connectionProviderId,
  });

  if (!isDefined(messagingProvider)) {
    return { messagingProvider: undefined, logicFunction: undefined };
  }

  return {
    messagingProvider,
    logicFunction: findApplicationFlatLogicFunction({
      flatLogicFunctionMaps,
      universalIdentifier:
        getLogicFunctionUniversalIdentifier(messagingProvider),
      applicationId: messagingProvider.applicationId,
    }),
  };
};
