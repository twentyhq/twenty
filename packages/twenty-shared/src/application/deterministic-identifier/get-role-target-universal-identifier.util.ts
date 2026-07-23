import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// An agent role target is identified by its agent within the application.
// One roleTarget per agent (unique on workspaceId + agentId).
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
