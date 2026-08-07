import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';
import { type ViewKey } from '@/types/ViewKey';

// Derivation-only discriminator of the system record-page fields view: it
// keys the view universal identifier but is never persisted, unlike
// ViewKey.INDEX which is also stored on the row.
export const FIELDS_WIDGET_SYSTEM_VIEW_KEY = 'FIELDS_WIDGET' as const;

export type SystemViewKey = ViewKey | typeof FIELDS_WIDGET_SYSTEM_VIEW_KEY;

export const getSystemViewUniversalIdentifier = ({
  objectMetadataApplicationUniversalIdentifier,
  objectUniversalIdentifier,
  viewKey,
}: {
  objectMetadataApplicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  viewKey: SystemViewKey;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'view',
    value: `${objectUniversalIdentifier}:${viewKey}`,
    applicationUniversalIdentifier:
      objectMetadataApplicationUniversalIdentifier,
  });
