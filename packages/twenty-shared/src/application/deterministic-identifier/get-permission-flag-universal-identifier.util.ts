import { computeOwnerScopedUniversalIdentifier } from '@/application/deterministic-identifier/compute-owner-scoped-universal-identifier.util';
import { ENTITY_TYPE_NAMESPACE_BY_TYPE } from '@/application/deterministic-identifier/entity-type-namespace.constant';

// A permission flag is identified by its key within its application.
export const getPermissionFlagUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  key,
}: {
  ownerApplicationUniversalIdentifier: string;
  key: string;
}): string =>
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.permissionFlag,
    value: key,
  });
