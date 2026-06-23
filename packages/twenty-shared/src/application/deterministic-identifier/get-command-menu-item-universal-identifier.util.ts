import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

const NAVIGATION_COMMAND_DISCRIMINATOR = 'navigation';

// A command menu item is identified by its label within its application
// (not every command is backed by a front component).
export const getCommandMenuItemUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  label,
}: {
  ownerApplicationUniversalIdentifier: string;
  label: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'commandMenuItem',
    value: label,
    applicationUniversalIdentifier: ownerApplicationUniversalIdentifier,
  });

// An object's singleton navigation command, keyed by the object + the 'navigation' role.
export const getNavigationCommandUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  objectUniversalIdentifier,
}: {
  ownerApplicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'commandMenuItem',
    value: `${objectUniversalIdentifier}:${NAVIGATION_COMMAND_DISCRIMINATOR}`,
    applicationUniversalIdentifier: ownerApplicationUniversalIdentifier,
  });
