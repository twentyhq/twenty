import { computeOwnerScopedUniversalIdentifier } from '@/application/deterministic-identifier/compute-owner-scoped-universal-identifier.util';
import { ENTITY_TYPE_NAMESPACE_BY_TYPE } from '@/application/deterministic-identifier/entity-type-namespace.constant';

// A role is identified by its label within its application.
export const getRoleUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  label,
}: {
  ownerApplicationUniversalIdentifier: string;
  label: string;
}): string =>
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.role,
    value: label,
  });
