import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getRelatedRecordPathUniversalIdentifier = ({
  applicationUniversalIdentifier,
  fieldMetadataUniversalIdentifiers,
}: {
  applicationUniversalIdentifier: string;
  fieldMetadataUniversalIdentifiers: string[];
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'relatedRecordPath',
    value: fieldMetadataUniversalIdentifiers.join(':'),
    applicationUniversalIdentifier,
  });
