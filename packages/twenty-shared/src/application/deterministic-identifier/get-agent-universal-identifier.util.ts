import { computeOwnerScopedUniversalIdentifier } from '@/application/deterministic-identifier/compute-owner-scoped-universal-identifier.util';
import { ENTITY_TYPE_NAMESPACE_BY_TYPE } from '@/application/deterministic-identifier/entity-type-namespace.constant';

// An agent is identified by its name within its application.
export const getAgentUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  name,
}: {
  ownerApplicationUniversalIdentifier: string;
  name: string;
}): string =>
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.agent,
    value: name,
  });
