import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A navigation menu item is identified by its name within its application.
export const getNavigationMenuItemUniversalIdentifier = ({
  applicationUniversalIdentifier,
  name,
}: {
  applicationUniversalIdentifier: string;
  name: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'navigationMenuItem',
    value: name,
    applicationUniversalIdentifier,
  });
