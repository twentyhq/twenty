import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

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
