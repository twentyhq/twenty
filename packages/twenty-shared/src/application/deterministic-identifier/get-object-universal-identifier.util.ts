import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// An object is identified by its nameSingular within its application.
export const getObjectUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  nameSingular,
}: {
  ownerApplicationUniversalIdentifier: string;
  nameSingular: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'objectMetadata',
    value: nameSingular,
    applicationUniversalIdentifier: ownerApplicationUniversalIdentifier,
  });
