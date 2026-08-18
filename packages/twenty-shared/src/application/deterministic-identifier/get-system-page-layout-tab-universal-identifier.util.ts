import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getSystemPageLayoutTabUniversalIdentifier = ({
  objectMetadataApplicationUniversalIdentifier,
  pageLayoutUniversalIdentifier,
  title,
}: {
  objectMetadataApplicationUniversalIdentifier: string;
  pageLayoutUniversalIdentifier: string;
  title: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'pageLayoutTab',
    value: `${pageLayoutUniversalIdentifier}:${title}`,
    applicationUniversalIdentifier:
      objectMetadataApplicationUniversalIdentifier,
  });
