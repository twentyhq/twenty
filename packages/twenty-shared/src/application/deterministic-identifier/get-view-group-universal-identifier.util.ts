import { computeOwnerScopedUniversalIdentifier } from '@/application/deterministic-identifier/compute-owner-scoped-universal-identifier.util';
import { ENTITY_TYPE_NAMESPACE_BY_TYPE } from '@/application/deterministic-identifier/entity-type-namespace.constant';

// A view group is identified by the field value it groups by, within its view.
export const getViewGroupUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  viewUniversalIdentifier,
  fieldValue,
}: {
  ownerApplicationUniversalIdentifier: string;
  viewUniversalIdentifier: string;
  fieldValue: string;
}): string =>
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.viewGroup,
    value: `${viewUniversalIdentifier}:${fieldValue}`,
  });
