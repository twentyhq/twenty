import { type ServedGeo } from '@/partners-marketplace/served-geos';
import { type PaletteToken } from '@/tokens';

// PROTOTYPE (?direction=e): each region draws its card covers in one of the
// artwork accents, as /customers cycles them per case study.
export const PARTNERS_STAGE_REGION_ACCENT: Record<ServedGeo, PaletteToken> = {
  EUROPE: 'blue',
  US: 'pink',
  LATAM: 'yellow',
  MENA: 'green',
  APAC: 'yellow',
  AFRICA: 'pink',
};
