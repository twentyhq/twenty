import request, { type Response } from 'supertest';
import { generateTransientTokenResponse } from 'test/integration/utils/generate-transient-token.util';

export const startAppPreferencesAuthorization = async ({
  applicationId,
  token = APPLE_JONY_MEMBER_ACCESS_TOKEN,
  reconnectingConnectedAccountId,
  visibility,
  redirectLocation,
}: {
  applicationId: string;
  token?: string;
  reconnectingConnectedAccountId?: string;
  visibility?: 'user' | 'workspace';
  redirectLocation?: string;
}): Promise<Response> => {
  const { data, errors } = await generateTransientTokenResponse({ token });

  expect(errors).toBeUndefined();

  return request(`http://localhost:${APP_PORT}`)
    .get('/auth/apps/authorize')
    .query({
      applicationId,
      providerName: 'preferences',
      transientToken: data.generateTransientToken.transientToken.token,
      reconnectingConnectedAccountId,
      visibility,
      redirectLocation,
    });
};
