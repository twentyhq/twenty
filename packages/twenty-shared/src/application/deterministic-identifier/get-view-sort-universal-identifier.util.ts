import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getViewSortUniversalIdentifier = ({
  applicationUniversalIdentifier,
  viewUniversalIdentifier,
  fieldMetadataUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  viewUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'viewSort',
    value: `${viewUniversalIdentifier}:${fieldMetadataUniversalIdentifier}`,
    applicationUniversalIdentifier,
  });
