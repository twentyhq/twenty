import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getApplicationGrantRoleUniversalIdentifier = ({
  grantedApplicationUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  grantedApplicationUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'role',
    value: `${grantedApplicationUniversalIdentifier}:APPLICATION_GRANT`,
    applicationUniversalIdentifier:
      workspaceCustomApplicationUniversalIdentifier,
  });
