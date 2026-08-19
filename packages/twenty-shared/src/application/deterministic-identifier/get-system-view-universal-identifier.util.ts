import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const SYSTEM_VIEW_KEYS = {
  INDEX: 'INDEX',
  FIELDS_WIDGET: 'FIELDS_WIDGET',
} as const;

export type SystemViewKey =
  (typeof SYSTEM_VIEW_KEYS)[keyof typeof SYSTEM_VIEW_KEYS];

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
