import { type ClientBriefRequest } from './client-brief-request-schema';

export type ClientBriefLogicFunctionPayload = {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  need: string;
  requirements?: string;
  hostingType?: 'CLOUD' | 'SELF_HOSTING';
  country?: string;
  languages?: readonly string[];
  seatCount?: string;
  timeline?: string;
  budgetRange?: string;
};

export function buildLogicFunctionPayload(
  request: ClientBriefRequest,
): ClientBriefLogicFunctionPayload {
  const payload: ClientBriefLogicFunctionPayload = {
    firstName: request.firstName,
    lastName: request.lastName,
    email: request.email,
    companyName: request.companyName,
    need: request.need,
  };

  if (request.requirements !== undefined) payload.requirements = request.requirements;
  if (request.hostingType !== undefined) payload.hostingType = request.hostingType;
  if (request.country !== undefined) payload.country = request.country;
  if (request.languages !== undefined && request.languages.length > 0)
    payload.languages = request.languages;
  if (request.seatCount !== undefined) payload.seatCount = request.seatCount;
  if (request.timeline !== undefined) payload.timeline = request.timeline;
  if (request.budgetRange !== undefined) payload.budgetRange = request.budgetRange;

  return payload;
}
