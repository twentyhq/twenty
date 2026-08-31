import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

const NAVIGATION_COMMAND_DISCRIMINATOR = 'navigation';

// An object's singleton navigation command menu item, keyed on the object plus
// the reserved navigation discriminator, under the application that owns the
// object rather than whichever application is performing the operation.
export const getSystemNavigationCommandMenuItemUniversalIdentifier = ({
  objectMetadataApplicationUniversalIdentifier,
  objectUniversalIdentifier,
}: {
  objectMetadataApplicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'commandMenuItem',
    value: `${objectUniversalIdentifier}:${NAVIGATION_COMMAND_DISCRIMINATOR}`,
    applicationUniversalIdentifier:
      objectMetadataApplicationUniversalIdentifier,
  });
