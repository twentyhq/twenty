import { type PartnerCountryValue } from './data/partner-country-options';
import { type PartnerLanguageValue } from './data/partner-language-options';
import { type PartnerScopeValue } from './data/partner-scope-options';
import { type PartnerTeamTypeValue } from './data/partner-team-type-options';
import { type PartnerTwentyExperienceValue } from './data/partner-twenty-experience-options';
import { type PartnerApplicationRequest } from './partner-application-request-schema';
import { splitFullName } from './split-full-name';

// The webhook (a logic function) expects first/last name, companyName, and
// domainName rather than the form's name/company/website. Empty optionals are
// omitted so the payload only carries what the applicant filled in.
export type PartnerApplicationLogicFunctionPayload = {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  domainName?: string;
  linkedin?: string;
  city?: string;
  country?: PartnerCountryValue;
  languages?: readonly PartnerLanguageValue[];
  typeOfTeam?: PartnerTeamTypeValue;
  partnerScope?: readonly PartnerScopeValue[];
  skills?: readonly string[];
  twentyExperience: readonly PartnerTwentyExperienceValue[];
  twentyExperienceNotes: string;
  twentyExperienceProofLink: string;
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
    twentyExperience: request.twentyExperience,
    twentyExperienceNotes: request.twentyExperienceNotes,
    twentyExperienceProofLink: request.twentyExperienceProofLink,
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
  if (request.hourlyRate !== undefined) payload.hourlyRate = request.hourlyRate;
  if (request.projectBudgetMin !== undefined)
    payload.projectBudgetMin = request.projectBudgetMin;
  if (request.calendarLink !== undefined)
    payload.calendarLink = request.calendarLink;

  return payload;
}
