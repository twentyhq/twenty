import { type McpServerManifest } from '@/application/mcpServerManifestType';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { normalizeMcpServerManifest } from '@/application/utils/normalizeMcpServerManifest';
import { isDefined } from '@/utils/validation/isDefined';

// Servers before 2.63 only read the deprecated { universalIdentifier } references, so built manifests carry both.
const toDeprecatedReference = (
  universalIdentifier: string | undefined,
): SyncableEntityOptions | undefined =>
  isDefined(universalIdentifier) ? { universalIdentifier } : undefined;

export const withDeprecatedMcpServerReferences = (
  mcpServerManifest: McpServerManifest,
): McpServerManifest => {
  const normalizedManifest = normalizeMcpServerManifest(mcpServerManifest);

  return {
    ...normalizedManifest,
    connectionProvider: toDeprecatedReference(
      normalizedManifest.connectionProviderUniversalIdentifier,
    ),
  };
};
