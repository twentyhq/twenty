import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getIndexFieldUniversalIdentifier = ({
  applicationUniversalIdentifier,
  indexUniversalIdentifier,
  fieldUniversalIdentifier,
  subFieldName,
}: {
  applicationUniversalIdentifier: string;
  indexUniversalIdentifier: string;
  fieldUniversalIdentifier: string;
  subFieldName?: string | null;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'indexField',
    value: `${indexUniversalIdentifier}:${fieldUniversalIdentifier}:${subFieldName ?? ''}`,
    applicationUniversalIdentifier,
  });
