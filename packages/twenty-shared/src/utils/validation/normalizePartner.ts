import { PARTNER_PATTERN } from '@/constants/PartnerPattern';
import { isString } from '@sniptt/guards';

export const normalizePartner = (value: unknown): string | undefined => {
  if (!isString(value)) {
    return undefined;
  }

  const partner = value.trim().toLowerCase();

  return PARTNER_PATTERN.test(partner) ? partner : undefined;
};
