import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A role permission flag is identified by its permission flag, within its role.
export const getRolePermissionFlagUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  roleUniversalIdentifier,
  permissionFlagUniversalIdentifier,
}: {
  ownerApplicationUniversalIdentifier: string;
  roleUniversalIdentifier: string;
  permissionFlagUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'rolePermissionFlag',
    value: `${roleUniversalIdentifier}:${permissionFlagUniversalIdentifier}`,
    applicationUniversalIdentifier: ownerApplicationUniversalIdentifier,
  });
