import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getSeededObjectViewFieldUniversalIdentifier = ({
  seededViewUniversalIdentifier,
  fieldMetadataUniversalIdentifier,
}: {
  seededViewUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'viewField',
    value: `${seededViewUniversalIdentifier}:${fieldMetadataUniversalIdentifier}`,
    applicationUniversalIdentifier: seededViewUniversalIdentifier,
  });
