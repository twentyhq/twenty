import { computeOwnerScopedUniversalIdentifier } from '@/application/deterministic-identifier/compute-owner-scoped-universal-identifier.util';
import { ENTITY_TYPE_NAMESPACE_BY_TYPE } from '@/application/deterministic-identifier/entity-type-namespace.constant';

// An option is identified by its stable value (not its renameable label) within its field.
export const getSelectOptionUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  fieldUniversalIdentifier,
  value,
}: {
  ownerApplicationUniversalIdentifier: string;
  fieldUniversalIdentifier: string;
  value: string;
}): string =>
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.selectOption,
    value: `${fieldUniversalIdentifier}:${value}`,
  });
