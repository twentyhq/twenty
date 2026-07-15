import { type ClientBriefRequest } from './client-brief-request-schema';

export function buildClientBriefPayload(data: ClientBriefRequest) {
  const payload = { ...data };
  if (payload.languages?.length === 0) {
    delete payload.languages;
  }
  return payload;
}
