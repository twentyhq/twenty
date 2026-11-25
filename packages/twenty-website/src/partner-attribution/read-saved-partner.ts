import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { PARTNER_ATTRIBUTION_WINDOW_DAYS } from './partner-attribution-window-days';
import { PARTNER_STORAGE_KEY } from './partner-storage-key';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const savedPartnerSchema = z.object({
  code: z.string(),
  savedAt: z.number(),
});

const parseSavedPartner = (raw: string) => {
  try {
    const result = savedPartnerSchema.safeParse(JSON.parse(raw));

    return result.success ? result.data : null;
  } catch {
    return null;
  }
};

export const readSavedPartner = ({
  storage,
  now,
}: {
  storage: Storage;
  now: number;
}): string | null => {
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
