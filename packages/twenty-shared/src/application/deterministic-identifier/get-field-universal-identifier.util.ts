import { computeOwnerScopedUniversalIdentifier } from '@/application/deterministic-identifier/compute-owner-scoped-universal-identifier.util';
import { ENTITY_TYPE_NAMESPACE_BY_TYPE } from '@/application/deterministic-identifier/entity-type-namespace.constant';

// A field is identified by its name within its object.
export const getFieldUniversalIdentifier = ({
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
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.field,
    value: `${objectUniversalIdentifier}:${name}`,
  });
