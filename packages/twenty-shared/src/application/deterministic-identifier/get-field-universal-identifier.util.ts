import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getFieldUniversalIdentifier = ({
  applicationUniversalIdentifier,
  objectUniversalIdentifier,
  name,
}: {
  applicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  name: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'fieldMetadata',
    value: `${objectUniversalIdentifier}:${name}`,
    applicationUniversalIdentifier,
  });
