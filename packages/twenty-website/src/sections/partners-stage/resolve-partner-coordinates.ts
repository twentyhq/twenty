import { isDefined } from 'twenty-shared/utils';

import { type ServedGeo } from '@/partners-marketplace/served-geos';

import { PARTNERS_STAGE_REGION_CENTER } from './partners-stage-region-center.data';
import { PARTNER_PLACE_COORDINATES } from './partner-place-coordinates.data';

const stripDiacritics = (value: string): string =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '');

// Null only when neither the city, the country nor a served region is known.
export const resolvePartnerCoordinates = (
  city: string,
  country: string,
  regions: readonly ServedGeo[] = [],
): readonly [number, number] | null => {
  const normalizedCity = stripDiacritics(city).toLowerCase();
  const cityKey = Object.keys(PARTNER_PLACE_COORDINATES.cities).find((key) =>
    normalizedCity.includes(key),
  );

  return (
    (isDefined(cityKey)
      ? PARTNER_PLACE_COORDINATES.cities[cityKey]
      : PARTNER_PLACE_COORDINATES.countries[country]) ??
    (isDefined(regions[0]) ? PARTNERS_STAGE_REGION_CENTER[regions[0]] : null)
  );
};
