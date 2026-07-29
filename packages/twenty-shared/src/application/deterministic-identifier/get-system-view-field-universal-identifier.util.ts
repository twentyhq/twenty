import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getSystemViewFieldUniversalIdentifier = ({
  fieldMetadataApplicationUniversalIdentifier,
  viewUniversalIdentifier,
  fieldMetadataUniversalIdentifier,
}: {
  fieldMetadataApplicationUniversalIdentifier: string;
  viewUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'viewField',
    value: `${viewUniversalIdentifier}:${fieldMetadataUniversalIdentifier}`,
    applicationUniversalIdentifier: fieldMetadataApplicationUniversalIdentifier,
  });
