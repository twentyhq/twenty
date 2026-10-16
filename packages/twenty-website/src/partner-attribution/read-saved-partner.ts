import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { partnerSchema } from './partner-schema';
import { PARTNER_STORAGE_KEY } from './partner-storage-key';

const savedPartnerSchema = z.object({
  partner: partnerSchema,
  expiresAt: z.number(),
});

export const readSavedPartner = (): string | undefined => {
  try {
    const savedPartner = savedPartnerSchema.safeParse(
      JSON.parse(localStorage.getItem(PARTNER_STORAGE_KEY) ?? 'null'),
    ).data;

    return isDefined(savedPartner) && savedPartner.expiresAt > Date.now()
      ? savedPartner.partner
      : undefined;
  } catch {
    return undefined;
  }
};
