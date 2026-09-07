import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

const NAVIGATION_COMMAND_DISCRIMINATOR = 'navigation';

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
