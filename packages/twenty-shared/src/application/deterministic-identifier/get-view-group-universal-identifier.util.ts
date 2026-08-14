import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getViewGroupUniversalIdentifier = ({
  applicationUniversalIdentifier,
  viewUniversalIdentifier,
  fieldValue,
}: {
  applicationUniversalIdentifier: string;
  viewUniversalIdentifier: string;
  fieldValue: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'viewGroup',
    value: `${viewUniversalIdentifier}:${fieldValue}`,
    applicationUniversalIdentifier,
  });
