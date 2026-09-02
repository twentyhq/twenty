import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getViewFieldUniversalIdentifier = ({
  applicationUniversalIdentifier,
  viewUniversalIdentifier,
  fieldMetadataUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  viewUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'viewField',
    value: `${viewUniversalIdentifier}:${fieldMetadataUniversalIdentifier}`,
    applicationUniversalIdentifier,
  });
