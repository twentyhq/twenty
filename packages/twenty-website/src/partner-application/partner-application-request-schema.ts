import { z } from 'zod';

import { PARTNER_COUNTRY_OPTIONS } from './data/partner-country-options';
import { PARTNER_LANGUAGE_OPTIONS } from './data/partner-language-options';
import { PARTNER_SCOPE_OPTIONS } from './data/partner-scope-options';
import { PARTNER_TEAM_TYPE_OPTIONS } from './data/partner-team-type-options';
import { PARTNER_TWENTY_EXPERIENCE_OPTIONS } from './data/partner-twenty-experience-options';
import { TWENTY_EXPERIENCE_NOTES_MIN_LENGTH } from './data/twenty-experience-notes-min-length';
import { emailFieldSchema } from './email-field-schema';
import { httpUrlFieldSchema } from './http-url-field-schema';

const countryValues = PARTNER_COUNTRY_OPTIONS.map((option) => option.value);
const languageValues = PARTNER_LANGUAGE_OPTIONS.map((option) => option.value);
const scopeValues = PARTNER_SCOPE_OPTIONS.map((option) => option.value);
const teamTypeValues = PARTNER_TEAM_TYPE_OPTIONS.map((option) => option.value);
const twentyExperienceValues = PARTNER_TWENTY_EXPERIENCE_OPTIONS.map(
  (option) => option.value,
);

const optionalUrl = httpUrlFieldSchema.optional();

export const partnerApplicationRequestSchema = z.strictObject({
  name: z.string().trim().min(1, { error: 'Name is required.' }),
  email: emailFieldSchema,
  company: z.string().trim().min(1, { error: 'Company is required.' }),
  website: httpUrlFieldSchema,
  linkedin: optionalUrl,
  city: z.string().trim().min(1, { error: 'City is required.' }),
  country: z.enum(countryValues).optional(),
  languages: z.array(z.enum(languageValues)).optional(),
  typeOfTeam: z.enum(teamTypeValues).optional(),
  partnerScope: z.array(z.enum(scopeValues)).optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
  twentyExperience: z
    .array(z.enum(twentyExperienceValues))
    .min(1, { error: 'Select at least one Twenty experience area.' }),
  twentyExperienceNotes: z
    .string()
    .trim()
    .min(TWENTY_EXPERIENCE_NOTES_MIN_LENGTH, {
      error: `Describe the implementation in at least ${TWENTY_EXPERIENCE_NOTES_MIN_LENGTH} characters.`,
    }),
  twentyExperienceProofLink: httpUrlFieldSchema,
  hourlyRate: z.number({ error: 'Hourly rate is required.' }).nonnegative(),
  projectBudgetMin: z
    .number({ error: 'Minimum project budget is required.' })
    .nonnegative(),
  calendarLink: optionalUrl,
});

export type PartnerApplicationRequest = z.infer<
  typeof partnerApplicationRequestSchema
>;
