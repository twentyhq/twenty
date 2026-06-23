import { computeOwnerScopedUniversalIdentifier } from '@/application/deterministic-identifier/compute-owner-scoped-universal-identifier.util';
import { ENTITY_TYPE_NAMESPACE_BY_TYPE } from '@/application/deterministic-identifier/entity-type-namespace.constant';

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
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.rolePermissionFlag,
    value: `${roleUniversalIdentifier}:${permissionFlagUniversalIdentifier}`,
  });
