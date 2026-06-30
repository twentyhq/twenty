import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A role permission flag is identified by its permission flag, within its role.
export const getRolePermissionFlagUniversalIdentifier = ({
  applicationUniversalIdentifier,
  roleUniversalIdentifier,
  permissionFlagUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  roleUniversalIdentifier: string;
  permissionFlagUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'rolePermissionFlag',
    value: `${roleUniversalIdentifier}:${permissionFlagUniversalIdentifier}`,
    applicationUniversalIdentifier,
  });
