import DigestFetch from 'digest-fetch';
import { getBasicAuthHeaders } from 'tsdav';
import { isDefined } from 'twenty-shared/utils';

export const createBasicDigestAuthFetch = (
  username: string,
  password: string,
  baseFetch: typeof globalThis.fetch = globalThis.fetch,
): typeof globalThis.fetch => {
  const digestClient = new DigestFetch(username, password);

  digestClient.getClient = async () => baseFetch;

  const { authorization: basicAuthorization } = getBasicAuthHeaders({
    username,
    password,
  });

  return async (input, init) => {
    const headers = new Headers(init?.headers);

    if (!headers.has('Authorization') && isDefined(basicAuthorization)) {
      headers.set('Authorization', basicAuthorization);
    }

    return digestClient.fetch(input, {
      ...init,
      headers,
    }) as Promise<Response>;
  };
};
