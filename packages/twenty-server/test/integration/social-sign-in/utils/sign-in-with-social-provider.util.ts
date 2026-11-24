import request from 'supertest';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

export const signInWithSocialProvider = async ({
  path,
  workspaceId,
  inviteToken,
}: {
  path: string;
  workspaceId: string;
  inviteToken?: string;
}): Promise<URL> => {
  const client = request(`http://localhost:${APP_PORT}`);

  const authorizationResponse = await client
    .get(path)
    .query({ workspaceId, ...(isDefined(inviteToken) ? { inviteToken } : {}) })
    .expect(302);

  const state = new URL(
    authorizationResponse.headers.location,
  ).searchParams.get('state');

  assertIsDefinedOrThrow(state);

  const callbackResponse = await client
    .get(`${path}/redirect`)
    .query({ code: 'mock-authorization-code', state })
    .expect(302);

  return new URL(callbackResponse.headers.location);
};
