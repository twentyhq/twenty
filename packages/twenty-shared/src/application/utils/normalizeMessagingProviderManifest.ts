import { type MessagingProviderManifest } from '@/application/messagingProviderManifestType';
import { resolveManifestReferenceUniversalIdentifier } from '@/application/utils/resolveManifestReferenceUniversalIdentifier';

// TODO(@FelixMalfait): remove with the deprecated { universalIdentifier } references once published apps no longer send them
export const normalizeMessagingProviderManifest = ({
  connectionProvider,
  sendMessageLogicFunction,
  markThreadAsReadLogicFunction,
  ...messagingProviderManifest
}: MessagingProviderManifest): MessagingProviderManifest => ({
  ...messagingProviderManifest,
  connectionProviderUniversalIdentifier:
    resolveManifestReferenceUniversalIdentifier({
      universalIdentifier:
        messagingProviderManifest.connectionProviderUniversalIdentifier,
      deprecatedReference: connectionProvider,
    }),
  sendMessageLogicFunctionUniversalIdentifier:
    resolveManifestReferenceUniversalIdentifier({
      universalIdentifier:
        messagingProviderManifest.sendMessageLogicFunctionUniversalIdentifier,
      deprecatedReference: sendMessageLogicFunction,
    }),
  markThreadAsReadLogicFunctionUniversalIdentifier:
    resolveManifestReferenceUniversalIdentifier({
      universalIdentifier:
        messagingProviderManifest.markThreadAsReadLogicFunctionUniversalIdentifier,
      deprecatedReference: markThreadAsReadLogicFunction,
    }),
});
