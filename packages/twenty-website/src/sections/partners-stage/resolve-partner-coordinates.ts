import { type ServedGeo } from '@/partners-marketplace/served-geos';

import { PARTNERS_STAGE_REGION_CENTER } from './partners-stage-region-center.data';
import { PARTNER_PLACE_COORDINATES } from './partner-place-coordinates.data';

const stripDiacritics = (value: string): string =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '');

// [longitude, latitude] of a partner's base: the city when the table knows
// it, else the country's capital, else (given the regions they serve) the
// centre of the first one. Null only when nothing at all is known.
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
    (cityKey !== undefined
      ? PARTNER_PLACE_COORDINATES.cities[cityKey]
      : PARTNER_PLACE_COORDINATES.countries[country]) ??
    (regions[0] !== undefined ? PARTNERS_STAGE_REGION_CENTER[regions[0]] : null)
  );
};
