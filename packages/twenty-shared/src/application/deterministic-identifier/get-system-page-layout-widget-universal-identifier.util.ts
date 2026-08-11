import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A widget is identified by its title within its tab.
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
