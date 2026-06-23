import { computeOwnerScopedUniversalIdentifier } from '@/application/deterministic-identifier/compute-owner-scoped-universal-identifier.util';
import { ENTITY_TYPE_NAMESPACE_BY_TYPE } from '@/application/deterministic-identifier/entity-type-namespace.constant';

// A view filter is identified by its field + operand (+ sub-field), within its view.
export const getViewFilterUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  viewUniversalIdentifier,
  fieldMetadataUniversalIdentifier,
  operand,
  subFieldName,
}: {
  ownerApplicationUniversalIdentifier: string;
  viewUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
  operand: string;
  subFieldName?: string | null;
}): string =>
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.viewFilter,
    value: `${viewUniversalIdentifier}:${fieldMetadataUniversalIdentifier}:${operand}:${subFieldName ?? ''}`,
  });
