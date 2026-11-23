import { type ServedGeo } from '@/partners-marketplace/served-geos';

// [longitude, latitude] a card cover centres on
// when the partner's base is not on the map.
export const REGION_CENTER: Record<ServedGeo, readonly [number, number]> = {
  EUROPE: [10, 50],
  US: [-98, 39],
  LATAM: [-60, -15],
  MENA: [40, 27],
  APAC: [110, 15],
  AFRICA: [20, 0],
};
