import {
  PARTNER_COUNTRY_VALUES,
  PARTNER_LANGUAGE_VALUES,
  PARTNER_SCOPE_VALUES,
  PARTNER_TYPE_OF_TEAM_VALUES,
} from '@/sections/PartnerApplication/wizard/partner-fields.data';
import { splitFullName } from '@/sections/PartnerApplication';
import { z } from 'zod';

const optionalNonEmptyString = z.string().trim().min(1).optional();

const optionalUrl = z
  .string()
  .trim()
  .min(1)
  .pipe(z.httpUrl({ error: 'Invalid URL.' }))
  .optional();

const optionalNonNegativeNumber = z.number().nonnegative().optional();

export const partnerApplicationRequestSchema = z.strictObject({
  // Identity
  name: z.string().trim().min(1, { error: 'Name is required.' }),
  email: z
    .string()
    .trim()
    .min(1, { error: 'Email is required.' })
    .pipe(z.email({ error: 'Invalid email address.' })),
  company: z.string().trim().min(1, { error: 'Company is required.' }),
  website: optionalUrl,

  // Profile
  linkedin: optionalUrl,
  city: optionalNonEmptyString,
  country: z.enum(PARTNER_COUNTRY_VALUES).optional(),
  languages: z.array(z.enum(PARTNER_LANGUAGE_VALUES)).optional(),

  // Expertise & experience
  typeOfTeam: z.enum(PARTNER_TYPE_OF_TEAM_VALUES).optional(),
  partnerScope: z.array(z.enum(PARTNER_SCOPE_VALUES)).optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
  applicationNotes: optionalNonEmptyString,

  // Commercials
  hourlyRate: optionalNonNegativeNumber,
  projectBudgetMin: optionalNonNegativeNumber,
  calendarLink: optionalUrl,
});

export type PartnerApplicationRequest = z.infer<
  typeof partnerApplicationRequestSchema
>;

export type PartnerApplicationLogicFunctionPayload = {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  domainName?: string;
  linkedin?: string;
  city?: string;
  country?: (typeof PARTNER_COUNTRY_VALUES)[number];
  languages?: ReadonlyArray<(typeof PARTNER_LANGUAGE_VALUES)[number]>;
  typeOfTeam?: (typeof PARTNER_TYPE_OF_TEAM_VALUES)[number];
  partnerScope?: ReadonlyArray<(typeof PARTNER_SCOPE_VALUES)[number]>;
  skills?: ReadonlyArray<string>;
  applicationNotes?: string;
  hourlyRate?: number;
  projectBudgetMin?: number;
  calendarLink?: string;
};

export function buildLogicFunctionPayload(
  request: PartnerApplicationRequest,
): PartnerApplicationLogicFunctionPayload {
  const { firstName, lastName } = splitFullName(request.name);

  const payload: PartnerApplicationLogicFunctionPayload = {
    firstName,
    lastName,
    email: request.email,
    companyName: request.company,
  };

  if (request.website !== undefined) payload.domainName = request.website;
  if (request.linkedin !== undefined) payload.linkedin = request.linkedin;
  if (request.city !== undefined) payload.city = request.city;
  if (request.country !== undefined) payload.country = request.country;
  if (request.languages !== undefined && request.languages.length > 0)
    payload.languages = request.languages;
  if (request.typeOfTeam !== undefined) payload.typeOfTeam = request.typeOfTeam;
  if (request.partnerScope !== undefined && request.partnerScope.length > 0)
    payload.partnerScope = request.partnerScope;
  if (request.skills !== undefined && request.skills.length > 0)
    payload.skills = request.skills;
  if (request.applicationNotes !== undefined)
    payload.applicationNotes = request.applicationNotes;
  if (request.hourlyRate !== undefined) payload.hourlyRate = request.hourlyRate;
  if (request.projectBudgetMin !== undefined)
    payload.projectBudgetMin = request.projectBudgetMin;
  if (request.calendarLink !== undefined)
    payload.calendarLink = request.calendarLink;

  return payload;
}
