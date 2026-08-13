import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getObjectUniversalIdentifier = ({
  applicationUniversalIdentifier,
  nameSingular,
}: {
  applicationUniversalIdentifier: string;
  nameSingular: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'objectMetadata',
    value: nameSingular,
    applicationUniversalIdentifier,
  });
