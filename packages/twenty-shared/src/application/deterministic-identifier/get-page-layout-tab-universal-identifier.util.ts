import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A tab is identified by its title within its page layout.
export const getPageLayoutTabUniversalIdentifier = ({
  applicationUniversalIdentifier,
  pageLayoutUniversalIdentifier,
  title,
}: {
  applicationUniversalIdentifier: string;
  pageLayoutUniversalIdentifier: string;
  title: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'pageLayoutTab',
    value: `${pageLayoutUniversalIdentifier}:${title}`,
    applicationUniversalIdentifier,
  });
