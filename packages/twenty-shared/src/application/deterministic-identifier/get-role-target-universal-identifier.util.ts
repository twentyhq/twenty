import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getRoleTargetUniversalIdentifier = ({
  applicationUniversalIdentifier,
  agentUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  agentUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'roleTarget',
    value: agentUniversalIdentifier,
    applicationUniversalIdentifier,
  });
