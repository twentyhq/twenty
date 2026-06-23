import { computeOwnerScopedUniversalIdentifier } from '@/application/deterministic-identifier/compute-owner-scoped-universal-identifier.util';
import { ENTITY_TYPE_NAMESPACE_BY_TYPE } from '@/application/deterministic-identifier/entity-type-namespace.constant';

// A view's identity within its object is its stable ViewKey when it has one
// (e.g. INDEX for the main table view), otherwise its author-given name.
export const getViewUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  objectUniversalIdentifier,
  key,
  name,
}: {
  ownerApplicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  key?: string;
  name?: string;
}): string =>
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.view,
    value: `${objectUniversalIdentifier}:${key ?? name}`,
  });
