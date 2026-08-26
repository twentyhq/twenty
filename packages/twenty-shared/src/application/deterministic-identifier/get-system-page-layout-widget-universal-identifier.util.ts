import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getSystemPageLayoutWidgetUniversalIdentifier = ({
  objectMetadataApplicationUniversalIdentifier,
  pageLayoutTabUniversalIdentifier,
  title,
}: {
  objectMetadataApplicationUniversalIdentifier: string;
  pageLayoutTabUniversalIdentifier: string;
  title: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'pageLayoutWidget',
    value: `${pageLayoutTabUniversalIdentifier}:${title}`,
    applicationUniversalIdentifier:
      objectMetadataApplicationUniversalIdentifier,
  });
