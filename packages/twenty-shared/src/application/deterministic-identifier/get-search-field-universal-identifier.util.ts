import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A search field is 1:1 with the field it makes searchable, so it is keyed by that field.
export const getSearchFieldUniversalIdentifier = ({
  applicationUniversalIdentifier,
  fieldMetadataUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'searchFieldMetadata',
    value: fieldMetadataUniversalIdentifier,
    applicationUniversalIdentifier,
  });
