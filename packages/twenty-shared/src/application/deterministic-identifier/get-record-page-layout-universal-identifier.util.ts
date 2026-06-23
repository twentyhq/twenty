import { computeOwnerScopedUniversalIdentifier } from '@/application/deterministic-identifier/compute-owner-scoped-universal-identifier.util';
import { ENTITY_TYPE_NAMESPACE_BY_TYPE } from '@/application/deterministic-identifier/entity-type-namespace.constant';

const RECORD_PAGE_LAYOUT_DISCRIMINATOR = 'RECORD_PAGE';

// An object's singleton record page layout (its name is server-generated), keyed by the object + the RECORD_PAGE role.
export const getRecordPageLayoutUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  objectUniversalIdentifier,
}: {
  ownerApplicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
}): string =>
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.pageLayout,
    value: `${objectUniversalIdentifier}:${RECORD_PAGE_LAYOUT_DISCRIMINATOR}`,
  });
