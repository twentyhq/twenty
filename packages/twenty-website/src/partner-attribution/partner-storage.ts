import { isPlainObject, normalizePartner } from 'twenty-shared/utils';

const PARTNER_STORAGE_KEY = 'partner';
// Same lifetime as the app's partner cookie.
const PARTNER_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

export const savePartner = (partner: string): void => {
  try {
    localStorage.setItem(
      PARTNER_STORAGE_KEY,
      JSON.stringify({ partner, expiresAt: Date.now() + PARTNER_LIFETIME_MS }),
    );
  } catch {
    // Storage can be blocked by the browser; attribution is best effort.
  }
};

export const readSavedPartner = (): string | undefined => {
  try {
    const savedPartner: unknown = JSON.parse(
      localStorage.getItem(PARTNER_STORAGE_KEY) ?? 'null',
    );

    if (
      !isPlainObject(savedPartner) ||
      typeof savedPartner.expiresAt !== 'number' ||
      savedPartner.expiresAt <= Date.now()
    ) {
      return undefined;
    }

    const partner = normalizePartner(savedPartner.partner);

    return partner === savedPartner.partner ? partner : undefined;
  } catch {
    return undefined;
  }
};
