import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getApplicationGrantRoleUniversalIdentifier = ({
  grantedApplicationUniversalIdentifier,
}: {
  grantedApplicationUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'role',
    value: `${grantedApplicationUniversalIdentifier}:APPLICATION_GRANT`,
    applicationUniversalIdentifier: grantedApplicationUniversalIdentifier,
  });
