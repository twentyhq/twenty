import { type ConnectionProviderManifest } from '@/application/connectionProviderManifestType';
import { type CustomConnectionProviderConfig } from '@/application/customConnectionProviderConfigType';
import { isDefined } from '@/utils/validation/isDefined';
import { resolveManifestReferenceUniversalIdentifier } from '@/application/utils/resolveManifestReferenceUniversalIdentifier';

const normalizeCustomConnectionProviderConfig = ({
  authorizeLogicFunction,
  callbackLogicFunction,
  ...custom
}: CustomConnectionProviderConfig): CustomConnectionProviderConfig => ({
  ...custom,
  authorizeLogicFunctionUniversalIdentifier:
    resolveManifestReferenceUniversalIdentifier({
      universalIdentifier: custom.authorizeLogicFunctionUniversalIdentifier,
      deprecatedReference: authorizeLogicFunction,
    }),
  callbackLogicFunctionUniversalIdentifier:
    resolveManifestReferenceUniversalIdentifier({
      universalIdentifier: custom.callbackLogicFunctionUniversalIdentifier,
      deprecatedReference: callbackLogicFunction,
    }),
});

// TODO(@FelixMalfait): remove with the deprecated { universalIdentifier } references once published apps no longer send them
export const normalizeConnectionProviderManifest = (
  connectionProviderManifest: ConnectionProviderManifest,
): ConnectionProviderManifest => {
  const {
    identifyAccountLogicFunction,
    onConnectLogicFunction,
    onDisconnectLogicFunction,
    ...manifestWithoutDeprecatedReferences
  } = connectionProviderManifest;

  const normalizedManifest: ConnectionProviderManifest = {
    ...manifestWithoutDeprecatedReferences,
    identifyAccountLogicFunctionUniversalIdentifier:
      resolveManifestReferenceUniversalIdentifier({
        universalIdentifier:
          connectionProviderManifest.identifyAccountLogicFunctionUniversalIdentifier,
        deprecatedReference: identifyAccountLogicFunction,
      }),
    onConnectLogicFunctionUniversalIdentifier:
      resolveManifestReferenceUniversalIdentifier({
        universalIdentifier:
          connectionProviderManifest.onConnectLogicFunctionUniversalIdentifier,
        deprecatedReference: onConnectLogicFunction,
      }),
    onDisconnectLogicFunctionUniversalIdentifier:
      resolveManifestReferenceUniversalIdentifier({
        universalIdentifier:
          connectionProviderManifest.onDisconnectLogicFunctionUniversalIdentifier,
        deprecatedReference: onDisconnectLogicFunction,
      }),
  };

  if (
    normalizedManifest.type !== 'custom' ||
    !isDefined(normalizedManifest.custom)
  ) {
    return normalizedManifest;
  }

  return {
    ...normalizedManifest,
    custom: normalizeCustomConnectionProviderConfig(normalizedManifest.custom),
  };
};
