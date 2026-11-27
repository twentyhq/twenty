import { type MessagingProviderManifest } from '@/application/messagingProviderManifestType';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { normalizeMessagingProviderManifest } from '@/application/utils/normalizeMessagingProviderManifest';
import { isDefined } from '@/utils/validation/isDefined';

// Servers before 2.63 only read the deprecated { universalIdentifier } references, so built manifests carry both.
const toDeprecatedReference = (
  universalIdentifier: string | undefined,
): SyncableEntityOptions | undefined =>
  isDefined(universalIdentifier) ? { universalIdentifier } : undefined;

export const withDeprecatedMessagingProviderReferences = (
  messagingProviderManifest: MessagingProviderManifest,
): MessagingProviderManifest => {
  const normalizedManifest = normalizeMessagingProviderManifest(
    messagingProviderManifest,
  );

  return {
    ...normalizedManifest,
    connectionProvider: toDeprecatedReference(
      normalizedManifest.connectionProviderUniversalIdentifier,
    ),
    sendMessageLogicFunction: toDeprecatedReference(
      normalizedManifest.sendMessageLogicFunctionUniversalIdentifier,
    ),
    markThreadAsReadLogicFunction: toDeprecatedReference(
      normalizedManifest.markThreadAsReadLogicFunctionUniversalIdentifier,
    ),
  };
};
