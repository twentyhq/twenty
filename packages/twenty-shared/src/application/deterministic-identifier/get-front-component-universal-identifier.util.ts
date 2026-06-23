import { computeOwnerScopedUniversalIdentifier } from '@/application/deterministic-identifier/compute-owner-scoped-universal-identifier.util';
import { ENTITY_TYPE_NAMESPACE_BY_TYPE } from '@/application/deterministic-identifier/entity-type-namespace.constant';

// A front component is identified by its component name within its application.
export const getFrontComponentUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  componentName,
}: {
  ownerApplicationUniversalIdentifier: string;
  componentName: string;
}): string =>
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.frontComponent,
    value: componentName,
  });
