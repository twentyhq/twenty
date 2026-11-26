import { type McpServerManifest } from '@/application/mcpServerManifestType';
import { resolveManifestReferenceUniversalIdentifier } from '@/application/utils/resolveManifestReferenceUniversalIdentifier';

// TODO(@FelixMalfait): remove with the deprecated { universalIdentifier } reference once published apps no longer send it
export const normalizeMcpServerManifest = ({
  connectionProvider,
  ...mcpServerManifest
}: McpServerManifest): McpServerManifest => ({
  ...mcpServerManifest,
  connectionProviderUniversalIdentifier:
    resolveManifestReferenceUniversalIdentifier({
      universalIdentifier:
        mcpServerManifest.connectionProviderUniversalIdentifier,
      deprecatedReference: connectionProvider,
    }),
});
