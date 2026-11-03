import { PARTNER_STORAGE_KEY } from './partner-storage-key';

// Matches the partner cookie on app.twenty.com and the affiliate program terms.
const PARTNER_ATTRIBUTION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

type SavedPartner = { partner: string; expiresAt: number };

const isSavedPartner = (value: unknown): value is SavedPartner =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as SavedPartner).partner === 'string' &&
  typeof (value as SavedPartner).expiresAt === 'number';

export const savePartner = (partner: string, now = Date.now()): void => {
  try {
    localStorage.setItem(
      PARTNER_STORAGE_KEY,
      JSON.stringify({
        partner,
        expiresAt: now + PARTNER_ATTRIBUTION_DURATION_MS,
      }),
    );
  } catch {
    return;
  }
};

export const readSavedPartner = (now = Date.now()): string | null => {
  try {
    const rawValue = localStorage.getItem(PARTNER_STORAGE_KEY);

    if (rawValue === null) {
      return null;
    }

    const savedPartner: unknown = JSON.parse(rawValue);

    return isSavedPartner(savedPartner) && savedPartner.expiresAt > now
      ? savedPartner.partner
      : null;
  } catch {
    return null;
  }
};
