import { computeOwnerScopedUniversalIdentifier } from '@/application/deterministic-identifier/compute-owner-scoped-universal-identifier.util';
import { ENTITY_TYPE_NAMESPACE_BY_TYPE } from '@/application/deterministic-identifier/entity-type-namespace.constant';

// An object permission is identified by its object, within its role.
export const getObjectPermissionUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  roleUniversalIdentifier,
  objectUniversalIdentifier,
}: {
  ownerApplicationUniversalIdentifier: string;
  roleUniversalIdentifier: string;
  objectUniversalIdentifier: string;
}): string =>
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.objectPermission,
    value: `${roleUniversalIdentifier}:${objectUniversalIdentifier}`,
  });
