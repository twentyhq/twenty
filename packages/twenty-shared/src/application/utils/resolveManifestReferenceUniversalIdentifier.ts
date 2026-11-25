import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

// Manifests built by an SDK older than 2.63 only carry the deprecated { universalIdentifier } form.
export const resolveManifestReferenceUniversalIdentifier = ({
  universalIdentifier,
  deprecatedReference,
}: {
  universalIdentifier: string | undefined;
  deprecatedReference: SyncableEntityOptions | undefined;
}): string | undefined =>
  universalIdentifier ?? deprecatedReference?.universalIdentifier;
