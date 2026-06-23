import { computeOwnerScopedUniversalIdentifier } from '@/application/deterministic-identifier/compute-owner-scoped-universal-identifier.util';
import { ENTITY_TYPE_NAMESPACE_BY_TYPE } from '@/application/deterministic-identifier/entity-type-namespace.constant';

// A field permission is identified by its field (which implies its object), within its role.
export const getFieldPermissionUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  roleUniversalIdentifier,
  fieldUniversalIdentifier,
}: {
  ownerApplicationUniversalIdentifier: string;
  roleUniversalIdentifier: string;
  fieldUniversalIdentifier: string;
}): string =>
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.fieldPermission,
    value: `${roleUniversalIdentifier}:${fieldUniversalIdentifier}`,
  });
