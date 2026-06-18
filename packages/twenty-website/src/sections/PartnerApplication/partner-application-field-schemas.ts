import {
  PARTNER_COUNTRY_VALUES,
  PARTNER_LANGUAGE_VALUES,
  PARTNER_SCOPE_VALUES,
  PARTNER_TYPE_OF_TEAM_VALUES,
} from '@/sections/PartnerApplication/wizard/partner-fields.data';
import { z } from 'zod';

// Single source of truth for partner-application validation, shared by the
// server route schema and the client wizard reducer so both reject the same
// values. This lives in the section layer (not the route) because sections must
// not import from `@/app/**`; the route imports from here instead.

export const emailFieldSchema = z
  .string()
  .trim()
  .min(1, { error: 'Email is required.' })
  .pipe(z.email({ error: 'Invalid email address.' }));

// z.httpUrl enforces an http(s) scheme and a TLD-shaped hostname. This means
// the client now rejects bare hosts like http://localhost, matching the server.
export const httpUrlFieldSchema = z
  .string()
  .trim()
  .min(1)
  .pipe(z.httpUrl({ error: 'Invalid URL.' }));

// Currency fields live in wizard state as strings, and the Form.Currency input
// allows digits plus a single decimal separator — so a lone "." (or "") can
// reach the reducer. Reject any non-empty value that doesn't represent a
// finite, non-negative number, so the wizard fails fast on the commercials step
// instead of submitting parseFloat(".") === NaN to the server.
export const nonNegativeAmountStringSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed >= 0;
    },
    { error: 'Enter a valid non-negative amount.' },
  );

const optionalNonEmptyString = z.string().trim().min(1).optional();
const optionalUrl = httpUrlFieldSchema.optional();

export const partnerApplicationRequestSchema = z.strictObject({
  // Identity
  name: z.string().trim().min(1, { error: 'Name is required.' }),
  email: emailFieldSchema,
  company: z.string().trim().min(1, { error: 'Company is required.' }),
  website: httpUrlFieldSchema,

  // Profile
  linkedin: optionalUrl,
  city: z.string().trim().min(1, { error: 'City is required.' }),
  country: z.enum(PARTNER_COUNTRY_VALUES).optional(),
  languages: z.array(z.enum(PARTNER_LANGUAGE_VALUES)).optional(),

  // Expertise & experience
  typeOfTeam: z.enum(PARTNER_TYPE_OF_TEAM_VALUES).optional(),
  partnerScope: z.array(z.enum(PARTNER_SCOPE_VALUES)).optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
  applicationNotes: optionalNonEmptyString,

  // Commercials
  hourlyRate: z.number({ error: 'Hourly rate is required.' }).nonnegative(),
  projectBudgetMin: z
    .number({ error: 'Minimum project budget is required.' })
    .nonnegative(),
  calendarLink: optionalUrl,
});

export type PartnerApplicationRequest = z.infer<
  typeof partnerApplicationRequestSchema
>;
