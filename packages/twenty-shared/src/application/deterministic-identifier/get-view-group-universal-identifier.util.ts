import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A view group is identified by the field value it groups by, within its view.
export const getViewGroupUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  viewUniversalIdentifier,
  fieldValue,
}: {
  ownerApplicationUniversalIdentifier: string;
  viewUniversalIdentifier: string;
  fieldValue: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'viewGroup',
    value: `${viewUniversalIdentifier}:${fieldValue}`,
    applicationUniversalIdentifier: ownerApplicationUniversalIdentifier,
  });
