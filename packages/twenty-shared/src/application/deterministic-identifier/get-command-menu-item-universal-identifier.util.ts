import { computeOwnerScopedUniversalIdentifier } from '@/application/deterministic-identifier/compute-owner-scoped-universal-identifier.util';
import { ENTITY_TYPE_NAMESPACE_BY_TYPE } from '@/application/deterministic-identifier/entity-type-namespace.constant';

// A command menu item is identified by its label within its application
// (not every command is backed by a front component).
export const getCommandMenuItemUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  label,
}: {
  ownerApplicationUniversalIdentifier: string;
  label: string;
}): string =>
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.commandMenuItem,
    value: label,
  });
