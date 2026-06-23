import { computeOwnerScopedUniversalIdentifier } from '@/application/deterministic-identifier/compute-owner-scoped-universal-identifier.util';
import { ENTITY_TYPE_NAMESPACE_BY_TYPE } from '@/application/deterministic-identifier/entity-type-namespace.constant';

// A view sort is identified by the field it sorts, within its view.
export const getViewSortUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  viewUniversalIdentifier,
  fieldMetadataUniversalIdentifier,
}: {
  ownerApplicationUniversalIdentifier: string;
  viewUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
}): string =>
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.viewSort,
    value: `${viewUniversalIdentifier}:${fieldMetadataUniversalIdentifier}`,
  });
