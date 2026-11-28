import { type ServedGeo } from '@/partners-marketplace/served-geos';

// Each region's card cover: the profile's globe turned to `center`
// ([longitude, latitude]) and closed in to `zoom`, the closest view that keeps
// every known city of the region (partner-place-coordinates.data.ts) inside
// the cover. The stills in public/images/partners/regions/<region>-card.webp,
// at twice the cover's size, are rendered from these views; change one, render
// its still again.
export const REGION_CARD_VIEW: Record<
  ServedGeo,
  { center: readonly [number, number]; zoom: number }
> = {
  EUROPE: { center: [6, 49], zoom: 2.3 },
  US: { center: [-98, 34], zoom: 1.7 },
  LATAM: { center: [-73, -1], zoom: 1.1 },
  MENA: { center: [23, 34], zoom: 2.5 },
  APAC: { center: [112, 0], zoom: 1 },
  AFRICA: { center: [20, -1], zoom: 1.1 },
};
