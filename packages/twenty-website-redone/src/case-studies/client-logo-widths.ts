import { type ClientLogoKey } from './client-logo-config';

// How wide each customer logo renders at its base size. The catalog thumbnail
// and the detail hero both scale from these (×1.4 and ×1.6 respectively).
export const CLIENT_LOGO_DISPLAY_WIDTHS: Record<ClientLogoKey, number> = {
  'nine-dots': 72,
  'alternative-partners': 220,
  netzero: 180,
  'act-education': 110,
  w3villa: 150,
  'elevate-consulting': 160,
};
