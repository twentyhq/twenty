import { ensureAbsoluteUrl, isNonEmptyString } from 'twenty-shared/utils';
import { z } from 'zod';

import { emailFieldSchema } from '@/partner-application/email-field-schema';
import { httpUrlFieldSchema } from '@/partner-application/http-url-field-schema';

import { AFFILIATE_PARTNER_TYPE_OPTIONS } from './data/affiliate-partner-type-options';

const partnerTypeValues = AFFILIATE_PARTNER_TYPE_OPTIONS.map(
  (option) => option.value,
);

// Applicants often type "youtube.com/@name": add the scheme instead of refusing it.
const withHttpsScheme = (value: unknown) =>
  isNonEmptyString(value) ? ensureAbsoluteUrl(value) : value;

// "john@gmail.com" becomes https://john@gmail.com, a URL whose host is gmail.com.
const hasNoCredentials = (value: string) => {
  try {
    return new URL(value).username === '';
  } catch {
    return false;
  }
};

export const affiliateApplicationRequestSchema = z.strictObject({
  name: z.string().trim().min(1, { error: 'Name is required.' }),
  email: emailFieldSchema,
  partnerType: z.enum(partnerTypeValues, {
    error: 'Partner type is required.',
  }),
  mainChannel: z.preprocess(
    withHttpsScheme,
    httpUrlFieldSchema.refine(hasNoCredentials, { error: 'Invalid URL.' }),
  ),
  audienceSize: z.string().trim().max(200).optional(),
  country: z.string().trim().max(100).optional(),
  promotionPlan: z.string().trim().max(2000).optional(),
  isIntegrationPartner: z.boolean().optional(),
  acceptsTerms: z.literal(true, {
    error: 'The program terms must be accepted.',
  }),
});

export type AffiliateApplicationRequest = z.infer<
  typeof affiliateApplicationRequestSchema
>;
