import { computeOwnerScopedUniversalIdentifier } from '@/application/deterministic-identifier/compute-owner-scoped-universal-identifier.util';
import { ENTITY_TYPE_NAMESPACE_BY_TYPE } from '@/application/deterministic-identifier/entity-type-namespace.constant';

// An object is identified by its nameSingular within its application.
export const getObjectUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  nameSingular,
}: {
  ownerApplicationUniversalIdentifier: string;
  nameSingular: string;
}): string =>
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.object,
    value: nameSingular,
  });
