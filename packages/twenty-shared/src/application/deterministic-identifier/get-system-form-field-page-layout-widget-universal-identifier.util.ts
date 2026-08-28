import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getSystemFormFieldPageLayoutWidgetUniversalIdentifier = ({
  fieldMetadataApplicationUniversalIdentifier,
  pageLayoutTabUniversalIdentifier,
  fieldMetadataUniversalIdentifier,
}: {
  fieldMetadataApplicationUniversalIdentifier: string;
  pageLayoutTabUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'pageLayoutWidget',
    value: `${pageLayoutTabUniversalIdentifier}:${fieldMetadataUniversalIdentifier}`,
    applicationUniversalIdentifier: fieldMetadataApplicationUniversalIdentifier,
  });
