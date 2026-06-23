import { computeOwnerScopedUniversalIdentifier } from '@/application/deterministic-identifier/compute-owner-scoped-universal-identifier.util';
import { ENTITY_TYPE_NAMESPACE_BY_TYPE } from '@/application/deterministic-identifier/entity-type-namespace.constant';

// An index is identified by its generated Postgres name (table + ordered columns
// + uniqueness + where-clause); a name change means a different index.
export const getIndexUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  objectUniversalIdentifier,
  name,
}: {
  ownerApplicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  name: string;
}): string =>
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.index,
    value: `${objectUniversalIdentifier}:${name}`,
  });
