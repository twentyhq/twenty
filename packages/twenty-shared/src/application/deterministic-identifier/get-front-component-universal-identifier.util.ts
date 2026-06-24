import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A front component is identified by its component name within its application.
export const getFrontComponentUniversalIdentifier = ({
  applicationUniversalIdentifier,
  componentName,
}: {
  applicationUniversalIdentifier: string;
  componentName: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'frontComponent',
    value: componentName,
    applicationUniversalIdentifier,
  });
