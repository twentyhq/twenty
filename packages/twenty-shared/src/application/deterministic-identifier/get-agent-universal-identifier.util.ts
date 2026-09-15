import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getAgentUniversalIdentifier = ({
  applicationUniversalIdentifier,
  name,
}: {
  applicationUniversalIdentifier: string;
  name: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'agent',
    value: name,
    applicationUniversalIdentifier,
  });
