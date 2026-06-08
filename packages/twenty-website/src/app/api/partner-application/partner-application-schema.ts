import {
  type PARTNER_COUNTRY_VALUES,
  type PARTNER_LANGUAGE_VALUES,
  type PARTNER_SCOPE_VALUES,
  type PARTNER_TYPE_OF_TEAM_VALUES,
} from '@/sections/PartnerApplication/wizard/partner-fields.data';
import { type PartnerApplicationRequest } from '@/sections/PartnerApplication/partner-application-field-schemas';
import { splitFullName } from '@/sections/PartnerApplication';

// The request schema and type live in the section layer so the client wizard
// can share them without `sections/**` importing from `@/app/**`. Re-export so
// existing route-side import paths keep working.
export {
  partnerApplicationRequestSchema,
  type PartnerApplicationRequest,
} from '@/sections/PartnerApplication/partner-application-field-schemas';

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
