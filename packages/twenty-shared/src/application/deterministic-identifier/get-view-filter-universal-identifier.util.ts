import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A view filter is identified by its field + operand (+ sub-field), within its view.
export const getViewFilterUniversalIdentifier = ({
  applicationUniversalIdentifier,
  viewUniversalIdentifier,
  fieldMetadataUniversalIdentifier,
  operand,
  subFieldName,
}: {
  applicationUniversalIdentifier: string;
  viewUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
  operand: string;
  subFieldName?: string | null;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'viewFilter',
    value: `${viewUniversalIdentifier}:${fieldMetadataUniversalIdentifier}:${operand}:${subFieldName ?? ''}`,
    applicationUniversalIdentifier,
  });
