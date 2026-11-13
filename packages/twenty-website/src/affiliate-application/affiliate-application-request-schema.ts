import { z } from 'zod';

import { emailFieldSchema } from '@/partner-application/email-field-schema';
import { lenientHttpUrlFieldSchema } from '@/partner-application/lenient-http-url-field-schema';

import { AFFILIATE_PARTNER_TYPE_OPTIONS } from './data/affiliate-partner-type-options';

const partnerTypeValues = AFFILIATE_PARTNER_TYPE_OPTIONS.map(
  (option) => option.value,
);

export const affiliateApplicationRequestSchema = z.strictObject({
  name: z.string().trim().min(1, { error: 'Name is required.' }),
  email: emailFieldSchema,
  partnerType: z.enum(partnerTypeValues, {
    error: 'Partner type is required.',
  }),
  mainChannel: lenientHttpUrlFieldSchema,
  audienceSize: z.string().trim().max(200).optional(),
  country: z.string().trim().max(100).optional(),
  promotionPlan: z.string().trim().max(2000).optional(),
  acceptsTerms: z.literal(true, {
    error: 'The program terms must be accepted.',
  }),
});

export type AffiliateApplicationRequest = z.infer<
  typeof affiliateApplicationRequestSchema
>;
