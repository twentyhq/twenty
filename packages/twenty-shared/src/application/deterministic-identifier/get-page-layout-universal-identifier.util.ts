import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

const RECORD_PAGE_LAYOUT_DISCRIMINATOR = 'RECORD_PAGE';

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

// An object's singleton record page layout (its name is server-generated), keyed by the object + the RECORD_PAGE role.
export const getRecordPageLayoutUniversalIdentifier = ({
  applicationUniversalIdentifier,
  objectUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'pageLayout',
    value: `${objectUniversalIdentifier}:${RECORD_PAGE_LAYOUT_DISCRIMINATOR}`,
    applicationUniversalIdentifier,
  });
