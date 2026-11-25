import { type ServedGeo } from '@/partners-marketplace/served-geos';

// The US / Mexico line, coarse: the land border west of the Rio Grande, the
// river down to the Gulf, then the Florida Straits. A box here once put
// Austin and Houston in LATAM.
const mexicoBorderLatitude = (longitude: number): number => {
  if (longitude < -108) {
    return 32.5;
  }
  if (longitude < -106.5) {
    return 31.3;
  }
  if (longitude < -97.2) {
    return 25.9 + ((longitude + 97.2) / (-106.5 + 97.2)) * (31.8 - 25.9);
  }
  return 24;
};

// Coarse boxes in the CRM's vocabulary (US means North America); null for unnamed land.
export const worldRegionOfCell = (
  longitude: number,
  latitude: number,
): ServedGeo | null => {
  if (longitude < -10 && longitude > -75 && latitude > 59) {
    return null;
  }
  if (longitude < -30) {
    return latitude < mexicoBorderLatitude(longitude) ? 'LATAM' : 'US';
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
