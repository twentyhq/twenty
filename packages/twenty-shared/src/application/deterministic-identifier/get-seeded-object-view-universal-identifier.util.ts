import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

const SEEDED_OBJECT_VIEW_KEY = 'SEEDED_DEFAULT' as const;

export const getSeededObjectViewUniversalIdentifier = ({
  objectMetadataApplicationUniversalIdentifier,
  objectUniversalIdentifier,
}: {
  objectMetadataApplicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'view',
    value: `${objectUniversalIdentifier}:${SEEDED_OBJECT_VIEW_KEY}`,
    applicationUniversalIdentifier:
      objectMetadataApplicationUniversalIdentifier,
  });
