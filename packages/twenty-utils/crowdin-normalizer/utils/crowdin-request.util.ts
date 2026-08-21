import { CrowdinApiError } from '../errors/crowdin-api.error';
import { type CrowdinContext } from '../types/crowdin-context.type';

const CROWDIN_BASE_URL = 'https://twenty.api.crowdin.com/api/v2';

export async function crowdinRequest<T>(
  { token }: CrowdinContext,
  endpoint: string,
  options: RequestInit = {},
): Promise<T | undefined> {
  const response = await fetch(`${CROWDIN_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const body = await response.text();

  if (!response.ok) {
    if (response.status === 404) return undefined;

    throw new CrowdinApiError(response.status, body);
  }

  if (!body) return undefined;

  return JSON.parse(body) as T;
}
