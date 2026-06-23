import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// An application variable is identified by its key within its application.
export const getApplicationVariableUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  key,
}: {
  ownerApplicationUniversalIdentifier: string;
  key: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'applicationVariable',
    value: key,
    applicationUniversalIdentifier: ownerApplicationUniversalIdentifier,
  });
