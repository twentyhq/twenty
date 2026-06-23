import { computeOwnerScopedUniversalIdentifier } from '@/application/deterministic-identifier/compute-owner-scoped-universal-identifier.util';
import { ENTITY_TYPE_NAMESPACE_BY_TYPE } from '@/application/deterministic-identifier/entity-type-namespace.constant';

// A widget is identified by its title within its tab.
export const getPageLayoutWidgetUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  pageLayoutTabUniversalIdentifier,
  title,
}: {
  ownerApplicationUniversalIdentifier: string;
  pageLayoutTabUniversalIdentifier: string;
  title: string;
}): string =>
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.pageLayoutWidget,
    value: `${pageLayoutTabUniversalIdentifier}:${title}`,
  });
