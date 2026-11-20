import { PARTNER_PLACE_COORDINATES } from './partner-place-coordinates.data';
import { WORLD_LAND_GRID } from './world-land-grid.data';

export type PartnerPlace = {
  // Percentages of the map box, so the overlay needs no measurement.
  leftPercent: number;
  topPercent: number;
};

const LONGITUDE_SPAN = 360;

const stripDiacritics = (value: string): string =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '');

export const resolvePartnerPlace = (
  city: string,
  country: string,
): PartnerPlace | null => {
  const normalizedCity = stripDiacritics(city).toLowerCase();
  const cityKey = Object.keys(PARTNER_PLACE_COORDINATES.cities).find((key) =>
    normalizedCity.includes(key),
  );
  const coordinates =
    cityKey !== undefined
      ? PARTNER_PLACE_COORDINATES.cities[cityKey]
      : PARTNER_PLACE_COORDINATES.countries[country];

  if (coordinates === undefined) {
    return null;
  }

  const [longitude, latitude] = coordinates;
  const latitudeSpan =
    WORLD_LAND_GRID.rows.length * WORLD_LAND_GRID.degreesPerCell;

  return {
    leftPercent: ((longitude + 180) / LONGITUDE_SPAN) * 100,
    topPercent:
      ((WORLD_LAND_GRID.northLatitude - latitude) / latitudeSpan) * 100,
  };
};
