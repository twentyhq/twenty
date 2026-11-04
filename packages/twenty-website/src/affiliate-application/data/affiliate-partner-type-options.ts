import { msg } from '@lingui/core/macro';

import { defineFieldOptions } from '@/partner-application/data/define-field-options';

export const AFFILIATE_PARTNER_TYPE_OPTIONS = defineFieldOptions([
  { value: 'CONTENT_CREATOR', label: msg`Content creator` },
  { value: 'COMMUNITY', label: msg`Community` },
  { value: 'CONSULTANT_AGENCY', label: msg`Consultant or agency` },
  { value: 'TECH_PARTNER', label: msg`Tech partner` },
]);

export type AffiliatePartnerTypeValue =
  (typeof AFFILIATE_PARTNER_TYPE_OPTIONS)[number]['value'];
