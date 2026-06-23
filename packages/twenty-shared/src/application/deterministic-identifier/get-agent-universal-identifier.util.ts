import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// An agent is identified by its name within its application.
export const getAgentUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  name,
}: {
  ownerApplicationUniversalIdentifier: string;
  name: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'agent',
    value: name,
    applicationUniversalIdentifier: ownerApplicationUniversalIdentifier,
  });
