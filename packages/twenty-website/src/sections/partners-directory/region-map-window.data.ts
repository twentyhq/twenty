import { type ServedGeo } from '@/partners-marketplace/served-geos';

// The [west, east, south, north] degrees each public/images/partners/regions/
// <region>.webp shows: an equirectangular window at the image's 2400 / 787
// ratio. Europe, US and MENA are 100° wide; LATAM, APAC and Africa are wider so
// every city in partner-place-coordinates.data.ts lands on its region's map.
export const REGION_MAP_WINDOW: Record<
  ServedGeo,
  readonly [number, number, number, number]
> = {
  EUROPE: [-35, 65, 31.6, 64.4],
  US: [-148, -48, 21.6, 54.4],
  LATAM: [-170.51, 24.75, -39.6, 24.43],
  MENA: [-10, 90, 8.6, 41.4],
  APAC: [-22.9, 255.18, -46.29, 44.9],
  AFRICA: [-60.68, 100.88, -38.92, 14.06],
};
