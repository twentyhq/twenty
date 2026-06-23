import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A front component is identified by its component name within its application.
export const getFrontComponentUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  componentName,
}: {
  ownerApplicationUniversalIdentifier: string;
  componentName: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'frontComponent',
    value: componentName,
    applicationUniversalIdentifier: ownerApplicationUniversalIdentifier,
  });
