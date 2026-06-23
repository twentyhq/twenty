import { computeOwnerScopedUniversalIdentifier } from '@/application/deterministic-identifier/compute-owner-scoped-universal-identifier.util';
import { ENTITY_TYPE_NAMESPACE_BY_TYPE } from '@/application/deterministic-identifier/entity-type-namespace.constant';

// A tab is identified by its title within its page layout.
export const getPageLayoutTabUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  pageLayoutUniversalIdentifier,
  title,
}: {
  ownerApplicationUniversalIdentifier: string;
  pageLayoutUniversalIdentifier: string;
  title: string;
}): string =>
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.pageLayoutTab,
    value: `${pageLayoutUniversalIdentifier}:${title}`,
  });
