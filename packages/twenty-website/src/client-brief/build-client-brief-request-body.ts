import { type ClientBriefRequest } from './client-brief-request-schema';
import { type ClientBriefState } from './client-brief-state';

function splitLanguages(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export function buildClientBriefRequestBody(
  state: ClientBriefState,
): ClientBriefRequest {
  const body: ClientBriefRequest = {
    firstName: state.firstName.trim(),
    lastName: state.lastName.trim(),
    email: state.email.trim(),
    companyName: state.companyName.trim(),
    need: state.need.trim(),
  };

  if (state.requirements.trim()) body.requirements = state.requirements.trim();
  if (state.hostingType !== '') body.hostingType = state.hostingType;
  if (state.country.trim()) body.country = state.country.trim();
  const languages = splitLanguages(state.languages);
  if (languages.length > 0) body.languages = languages;
  if (state.seatCount.trim()) body.seatCount = state.seatCount.trim();
  if (state.timeline.trim()) body.timeline = state.timeline.trim();
  if (state.budgetRange.trim()) body.budgetRange = state.budgetRange.trim();

  return body;
}
