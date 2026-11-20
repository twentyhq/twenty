import { type ServedGeo } from '@/partners-marketplace/served-geos';

// PROTOTYPE: which served region a land cell belongs to, in the CRM's own
// vocabulary (US stands for North America). Coarse boxes, enough for a map;
// null for land no region names (Russia east of Europe, Greenland).
export const worldRegionOfCell = (
  longitude: number,
  latitude: number,
): ServedGeo | null => {
  if (longitude < -10 && longitude > -75 && latitude > 59) {
    return null;
  }
  if (longitude < -30) {
    const isMexicoOrSouth =
      latitude < 15 || (latitude < 32 && longitude > -118 && longitude < -86);
    return isMexicoOrSouth ? 'LATAM' : 'US';
  }
  if (latitude >= 36 && longitude < 40) {
    return 'EUROPE';
  }
  if (latitude >= 45 && longitude < 60) {
    return 'EUROPE';
  }
  if (latitude >= 50) {
    return null;
  }
  if (longitude < 63 && latitude >= 15 && latitude < 42) {
    return 'MENA';
  }
  if (longitude < 55 && latitude < 15) {
    return 'AFRICA';
  }
  return 'APAC';
};
