import { PARTNER_ATTRIBUTION_LIFETIME_DAYS } from 'twenty-shared/constants';

import { PARTNER_STORAGE_KEY } from './partner-storage-key';

const DAY_MS = 24 * 60 * 60 * 1000;

export const savePartner = (partner: string): void => {
  try {
    localStorage.setItem(
      PARTNER_STORAGE_KEY,
      JSON.stringify({
        partner,
        expiresAt: Date.now() + PARTNER_ATTRIBUTION_LIFETIME_DAYS * DAY_MS,
      }),
    );
  } catch {
    return;
  }
};
