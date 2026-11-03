import { isDefined } from 'twenty-shared/utils';

import { PARTNER_ATTRIBUTION_WINDOW_DAYS } from './partner-attribution-window-days';
import { PARTNER_STORAGE_KEY } from './partner-storage-key';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

type SavedPartner = { code: string; savedAt: number };

const parseSavedPartner = (raw: string): SavedPartner | null => {
  try {
    const value: unknown = JSON.parse(raw);

    return isDefined(value) &&
      typeof value === 'object' &&
      typeof (value as SavedPartner).code === 'string' &&
      typeof (value as SavedPartner).savedAt === 'number'
      ? (value as SavedPartner)
      : null;
  } catch {
    return null;
  }
};

export const readSavedPartner = (
  storage: Storage,
  now: number,
): string | null => {
  const raw = storage.getItem(PARTNER_STORAGE_KEY);

  if (!isDefined(raw)) {
    return null;
  }

  const saved = parseSavedPartner(raw);

  if (
    !isDefined(saved) ||
    now - saved.savedAt > PARTNER_ATTRIBUTION_WINDOW_DAYS * DAY_IN_MILLISECONDS
  ) {
    storage.removeItem(PARTNER_STORAGE_KEY);
    return null;
  }

  return saved.code;
};
