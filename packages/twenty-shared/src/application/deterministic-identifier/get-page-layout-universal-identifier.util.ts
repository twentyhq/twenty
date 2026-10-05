import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A page layout is identified by its name within its object (or the app for standalone layouts).
export const getPageLayoutUniversalIdentifier = ({
  applicationUniversalIdentifier,
  objectUniversalIdentifier,
  name,
}: {
  applicationUniversalIdentifier: string;
  objectUniversalIdentifier?: string;
  name: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'pageLayout',
    value: objectUniversalIdentifier
      ? `${objectUniversalIdentifier}:${name}`
      : name,
    applicationUniversalIdentifier,
  });
