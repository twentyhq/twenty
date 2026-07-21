import { z } from 'zod';

import { emailFieldSchema } from '@/partner-application/email-field-schema';

import { CLIENT_BRIEF_HOSTING_TYPES } from './data/hosting-type-values';

const optionalNonEmptyString = z.string().trim().min(1).optional();

export const clientBriefRequestSchema = z.strictObject({
  firstName: z.string().trim().min(1, { error: 'First name is required.' }),
  lastName: z.string(),
  email: emailFieldSchema,
  companyName: z.string().trim().min(1, { error: 'Company name is required.' }),
  need: z.string().trim().min(1, { error: 'Need is required.' }),
  requirements: optionalNonEmptyString,
  hostingType: z.enum(CLIENT_BRIEF_HOSTING_TYPES).optional(),
  country: optionalNonEmptyString,
  languages: z.array(z.string().trim().min(1)).optional(),
  seatCount: optionalNonEmptyString,
  timeline: optionalNonEmptyString,
  budgetRange: optionalNonEmptyString,
});

export type ClientBriefRequest = z.infer<typeof clientBriefRequestSchema>;
