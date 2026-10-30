import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A path is unique by its ordered hop fields, so it is keyed by them.
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
