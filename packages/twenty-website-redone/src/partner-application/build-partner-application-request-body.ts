import { type PartnerApplicationRequest } from './partner-application-request-schema';
import { type PartnerApplicationState } from './partner-application-state';

export function buildPartnerApplicationRequestBody(
  state: PartnerApplicationState,
): PartnerApplicationRequest {
  const body: PartnerApplicationRequest = {
    name: state.name.trim(),
    email: state.email.trim(),
    company: state.company.trim(),
    website: state.website.trim(),
    city: state.city.trim(),
    hourlyRate: Number.parseFloat(state.hourlyRate),
    projectBudgetMin: Number.parseFloat(state.projectBudgetMin),
  };

  if (state.linkedin.trim()) body.linkedin = state.linkedin.trim();
  if (state.country !== '') body.country = state.country;
  if (state.languages.length > 0) body.languages = state.languages;
  if (state.typeOfTeam !== '') body.typeOfTeam = state.typeOfTeam;
  if (state.partnerScope.length > 0) body.partnerScope = state.partnerScope;
  if (state.skills.length > 0) body.skills = state.skills;
  if (state.applicationNotes.trim())
    body.applicationNotes = state.applicationNotes.trim();
  if (state.calendarLink.trim()) body.calendarLink = state.calendarLink.trim();

  return body;
}
