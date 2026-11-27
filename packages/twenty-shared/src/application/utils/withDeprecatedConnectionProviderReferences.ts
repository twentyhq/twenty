import { type ConnectionProviderManifest } from '@/application/connectionProviderManifestType';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { normalizeConnectionProviderManifest } from '@/application/utils/normalizeConnectionProviderManifest';
import { isDefined } from '@/utils/validation/isDefined';

// Servers before 2.63 only read the deprecated { universalIdentifier } references, so built manifests carry both.
const toDeprecatedReference = (
  universalIdentifier: string | undefined,
): SyncableEntityOptions | undefined =>
  isDefined(universalIdentifier) ? { universalIdentifier } : undefined;

export const withDeprecatedConnectionProviderReferences = (
  connectionProviderManifest: ConnectionProviderManifest,
): ConnectionProviderManifest => {
  const normalizedManifest = normalizeConnectionProviderManifest(
    connectionProviderManifest,
  );

  const manifestWithDeprecatedReferences: ConnectionProviderManifest = {
    ...normalizedManifest,
    identifyAccountLogicFunction: toDeprecatedReference(
      normalizedManifest.identifyAccountLogicFunctionUniversalIdentifier,
    ),
    onConnectLogicFunction: toDeprecatedReference(
      normalizedManifest.onConnectLogicFunctionUniversalIdentifier,
    ),
    onDisconnectLogicFunction: toDeprecatedReference(
      normalizedManifest.onDisconnectLogicFunctionUniversalIdentifier,
    ),
  };

  if (
    manifestWithDeprecatedReferences.type !== 'custom' ||
    !isDefined(manifestWithDeprecatedReferences.custom)
  ) {
    return manifestWithDeprecatedReferences;
  }

  const { custom } = manifestWithDeprecatedReferences;

  return {
    ...manifestWithDeprecatedReferences,
    custom: {
      ...custom,
      authorizeLogicFunction: toDeprecatedReference(
        custom.authorizeLogicFunctionUniversalIdentifier,
      ),
      callbackLogicFunction: toDeprecatedReference(
        custom.callbackLogicFunctionUniversalIdentifier,
      ),
    },
  };
};
