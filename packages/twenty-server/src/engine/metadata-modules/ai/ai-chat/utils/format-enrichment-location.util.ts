import { isNonEmptyString } from '@sniptt/guards';

export const formatEnrichmentLocation = ({
  locality,
  region,
  country,
}: {
  locality: string | null;
  region: string | null;
  country: string | null;
}): string | null => {
  const location = [locality, region, country]
    .filter(isNonEmptyString)
    .join(', ');

  return isNonEmptyString(location) ? location : null;
};
