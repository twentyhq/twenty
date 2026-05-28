import {
  PARTNER_COUNTRY_VALUES,
  PARTNER_DEPLOYMENT_VALUES,
  PARTNER_LANGUAGE_VALUES,
  PARTNER_SCOPE_VALUES,
  PARTNER_TYPE_OF_TEAM_VALUES,
} from '@/sections/PartnerApplication/wizard/partner-fields.data';
import { splitFullName } from '@/sections/PartnerApplication';
import { z } from 'zod';

const optionalNonEmptyString = z
  .string()
  .trim()
  .min(1)
  .optional();

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
  countryOther: optionalNonEmptyString,
  languages: z.array(z.enum(PARTNER_LANGUAGE_VALUES)).optional(),
  languagesOther: optionalNonEmptyString,

  // Expertise & experience
  typeOfTeam: z.enum(PARTNER_TYPE_OF_TEAM_VALUES).optional(),
  partnerScope: z.array(z.enum(PARTNER_SCOPE_VALUES)).optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
  deploymentExpertise: z
    .array(z.enum(PARTNER_DEPLOYMENT_VALUES))
    .optional(),
  workspaceUrl: optionalUrl,
  customerReferences: optionalNonEmptyString,

  // Commercials
  hourlyRate: optionalNonNegativeNumber,
  projectBudgetMin: optionalNonNegativeNumber,
  calendarLink: optionalUrl,
});

export type PartnerApplicationRequest = z.infer<
  typeof partnerApplicationRequestSchema
>;

export type PartnerApplicationWebhookPayload = {
  FirstName: string;
  LastName: string;
  Email: string;
  Company: string;
  Website?: string;
  Linkedin?: string;
  City?: string;
  Country?: (typeof PARTNER_COUNTRY_VALUES)[number];
  CountryOther?: string;
  LanguagesSpoken?: ReadonlyArray<(typeof PARTNER_LANGUAGE_VALUES)[number]>;
  LanguagesOther?: string;
  TypeOfTeam?: (typeof PARTNER_TYPE_OF_TEAM_VALUES)[number];
  PartnerScope?: ReadonlyArray<(typeof PARTNER_SCOPE_VALUES)[number]>;
  Skills?: ReadonlyArray<string>;
  DeploymentExpertise?: ReadonlyArray<
    (typeof PARTNER_DEPLOYMENT_VALUES)[number]
  >;
  WorkspaceUrl?: string;
  CustomerReferences?: string;
  HourlyRate?: number;
  ProjectBudgetMin?: number;
  CalendarLink?: string;
  CurrencyCode: 'USD';
};

export function buildWebhookPayload(
  request: PartnerApplicationRequest,
): PartnerApplicationWebhookPayload {
  const { firstName, lastName } = splitFullName(request.name);

  const payload: PartnerApplicationWebhookPayload = {
    FirstName: firstName,
    LastName: lastName,
    Email: request.email,
    Company: request.company,
    CurrencyCode: 'USD',
  };

  if (request.website !== undefined) payload.Website = request.website;
  if (request.linkedin !== undefined) payload.Linkedin = request.linkedin;
  if (request.city !== undefined) payload.City = request.city;
  if (request.country !== undefined) payload.Country = request.country;
  if (request.countryOther !== undefined)
    payload.CountryOther = request.countryOther;
  if (request.languages !== undefined && request.languages.length > 0)
    payload.LanguagesSpoken = request.languages;
  if (request.languagesOther !== undefined)
    payload.LanguagesOther = request.languagesOther;
  if (request.typeOfTeam !== undefined)
    payload.TypeOfTeam = request.typeOfTeam;
  if (request.partnerScope !== undefined && request.partnerScope.length > 0)
    payload.PartnerScope = request.partnerScope;
  if (request.skills !== undefined && request.skills.length > 0)
    payload.Skills = request.skills;
  if (
    request.deploymentExpertise !== undefined &&
    request.deploymentExpertise.length > 0
  )
    payload.DeploymentExpertise = request.deploymentExpertise;
  if (request.workspaceUrl !== undefined)
    payload.WorkspaceUrl = request.workspaceUrl;
  if (request.customerReferences !== undefined)
    payload.CustomerReferences = request.customerReferences;
  if (request.hourlyRate !== undefined)
    payload.HourlyRate = request.hourlyRate;
  if (request.projectBudgetMin !== undefined)
    payload.ProjectBudgetMin = request.projectBudgetMin;
  if (request.calendarLink !== undefined)
    payload.CalendarLink = request.calendarLink;

  return payload;
}
