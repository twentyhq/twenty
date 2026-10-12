import request from 'supertest';
import { insertApplicationRegistrationVariable } from 'test/integration/metadata/suites/application-registration-variable/utils/insert-application-registration-variable.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { makeMetadataApiRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';
import { generateTransientToken } from 'test/integration/utils/generate-transient-token.util';
import { getDataOrThrow } from 'test/integration/utils/query-messaging.util';
import gql from 'graphql-tag';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const APP_ID = uuidv4();
const APP_ROLE_ID = uuidv4();
const APP_PROVIDER_ID = uuidv4();
const PKCE_PROVIDER_ID = uuidv4();

const SHARED_BY_TIM_ID = uuidv4();
const PRIVATE_OF_TIM_ID = uuidv4();
const PRIVATE_OF_JONY_ID = uuidv4();

describe('app connection management guards (e2e)', () => {
  let applicationDbId: string;
  let providerDbId: string;

  const insertAppConnection = async ({
    id,
    visibility,
    userWorkspaceId,
  }: {
    id: string;
    visibility: 'user' | 'workspace';
    userWorkspaceId: string;
  }): Promise<void> => {
    await globalThis.testDataSource.query(
      `INSERT INTO core."connectedAccount"
         (id, handle, provider, visibility, "workspaceId", "userWorkspaceId",
          "applicationId", "connectionProviderId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        'slack-bot@apple.dev',
        ConnectedAccountProvider.APP,
        visibility,
        SEED_APPLE_WORKSPACE_ID,
        userWorkspaceId,
        applicationDbId,
        providerDbId,
      ],
    );
  };

  const generateMemberTransientToken = async (): Promise<string> => {
    const response = await makeMetadataApiRequestWithMemberRole({
      query: gql`
        mutation GenerateTransientToken {
          generateTransientToken {
            transientToken {
              token
            }
          }
        }
      `,
    });

    const data = getDataOrThrow(response) as {
      generateTransientToken: { transientToken: { token: string } };
    };

    return data.generateTransientToken.transientToken.token;
  };

  const startAuthorizeAndGetErrorMessage = async ({
    reconnectingConnectedAccountId,
    visibility,
    asMember = false,
  }: {
    reconnectingConnectedAccountId?: string;
    visibility?: 'user' | 'workspace';
    asMember?: boolean;
  }): Promise<string> => {
    const response = await request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/authorize')
      .query({
        applicationId: applicationDbId,
        providerName: 'slack',
        transientToken: asMember
          ? await generateMemberTransientToken()
          : await generateTransientToken(),
        ...(isDefined(reconnectingConnectedAccountId)
          ? { reconnectingConnectedAccountId }
          : {}),
        ...(isDefined(visibility) ? { visibility } : {}),
      });

    expect(response.status).toBe(302);

    return getErrorMessageFromRedirect(response.headers.location);
  };

  const getErrorMessageFromRedirect = (location: string): string =>
    new URL(location).searchParams.get('errorMessage') ?? '';

  const startPkceFlow = async (): Promise<{
    authorizationUrl: URL;
    state: string;
    flowCookie: string;
  }> => {
    const response = await request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/authorize')
      .query({
        applicationId: applicationDbId,
        providerName: 'pkce-provider',
        transientToken: await generateTransientToken(),
      });

    expect(response.status).toBe(302);

    const authorizationUrl = new URL(response.headers.location);
    const state = authorizationUrl.searchParams.get('state');

    expect(state).toEqual(expect.any(String));

    const setCookieHeader = response.headers['set-cookie'] as unknown as
      | string[]
      | undefined;
    const flowSetCookie = (setCookieHeader ?? []).find((cookie) =>
      cookie.includes('app-oauth-flow='),
    );

    expect(flowSetCookie).toBeDefined();

    return {
      authorizationUrl,
      state: state as string,
      flowCookie: (flowSetCookie as string).split(';')[0],
    };
  };

  const callbackAndGetErrorMessage = async ({
    state,
    flowCookie,
  }: {
    state: string;
    flowCookie?: string;
  }): Promise<string> => {
    const callbackRequest = request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/callback')
      .query({ code: 'provider-issued-code', state });

    const response = isDefined(flowCookie)
      ? await callbackRequest.set('Cookie', flowCookie)
      : await callbackRequest;

    expect(response.status).toBe(302);

    return getErrorMessageFromRedirect(response.headers.location);
  };

  const decodeJwtPayload = (token: string): Record<string, unknown> =>
    JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_ID,
      name: 'test-app-connection-management-guards',
      description: 'App for testing app connection management guards',
      sourcePath: 'test-app-connection-management-guards',
    });

    await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_ID,
        roleId: APP_ROLE_ID,
        overrides: {
          connectionProviders: [
            {
              universalIdentifier: APP_PROVIDER_ID,
              name: 'slack',
              displayName: 'Slack',
              type: 'oauth',
              oauth: {
                authorizationEndpoint: 'https://slack.com/oauth/v2/authorize',
                tokenEndpoint: 'https://slack.com/api/oauth.v2.access',
                scopes: ['chat:write'],
                clientIdVariable: 'SLACK_CLIENT_ID',
                clientSecretVariable: 'SLACK_CLIENT_SECRET',
              },
            },
            {
              universalIdentifier: PKCE_PROVIDER_ID,
              name: 'pkce-provider',
              displayName: 'PKCE provider',
              type: 'oauth',
              oauth: {
                authorizationEndpoint:
                  'https://pkce-provider.invalid/authorize',
                // Unresolvable on purpose: the token exchange fails fast
                // once the state checks have passed.
                tokenEndpoint: 'https://pkce-provider.invalid/token',
                scopes: ['read'],
                clientIdVariable: 'PKCE_PROVIDER_CLIENT_ID',
                clientSecretVariable: 'PKCE_PROVIDER_CLIENT_SECRET',
                usePkce: true,
              },
            },
          ],
        },
      }),
      expectToFail: false,
    });

    jest.useRealTimers();

    const providers = await findConnectionProvidersByApplication(APP_ID);
    const provider = providers.find(({ name }) => name === 'slack');

    if (!isDefined(provider)) {
      throw new Error('Slack connection provider was not synced');
    }

    applicationDbId = provider.applicationId;
    providerDbId = provider.id;

    const [{ applicationRegistrationId }] =
      await globalThis.testDataSource.query(
        `SELECT "applicationRegistrationId" FROM core."application" WHERE id = $1`,
        [applicationDbId],
      );

    await insertApplicationRegistrationVariable({
      applicationRegistrationId,
      key: 'PKCE_PROVIDER_CLIENT_ID',
      value: 'pkce-provider-client-id',
      isSecret: false,
    });
    await insertApplicationRegistrationVariable({
      applicationRegistrationId,
      key: 'PKCE_PROVIDER_CLIENT_SECRET',
      value: 'pkce-provider-client-secret',
    });

    await insertAppConnection({
      id: SHARED_BY_TIM_ID,
      visibility: 'workspace',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
    });
    await insertAppConnection({
      id: PRIVATE_OF_TIM_ID,
      visibility: 'user',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
    });
    await insertAppConnection({
      id: PRIVATE_OF_JONY_ID,
      visibility: 'user',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
    });
  }, 180000);

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."connectedAccount"
        WHERE "workspaceId" = $1 AND "applicationId" = $2`,
      [SEED_APPLE_WORKSPACE_ID, applicationDbId],
    );

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_ID,
    });
  }, 120000);

  it('refuses to reconnect a private connection owned by another member', async () => {
    const errorMessage = await startAuthorizeAndGetErrorMessage({
      reconnectingConnectedAccountId: PRIVATE_OF_TIM_ID,
    });

    expect(errorMessage).toContain(
      `Cannot reconnect connectedAccount ${PRIVATE_OF_TIM_ID}`,
    );
  });

  it('lets a member with the Applications permission reconnect a workspace-shared connection', async () => {
    const errorMessage = await startAuthorizeAndGetErrorMessage({
      reconnectingConnectedAccountId: SHARED_BY_TIM_ID,
    });

    expect(errorMessage).not.toContain('Cannot reconnect connectedAccount');
    expect(errorMessage).not.toContain('does not have permission');
  });

  it('refuses a member without the Applications permission to reconnect a workspace-shared connection', async () => {
    const errorMessage = await startAuthorizeAndGetErrorMessage({
      reconnectingConnectedAccountId: SHARED_BY_TIM_ID,
      asMember: true,
    });

    expect(errorMessage).toContain('does not have permission');
  });

  it('refuses a member without the Applications permission to create a workspace-shared connection', async () => {
    const errorMessage = await startAuthorizeAndGetErrorMessage({
      visibility: 'workspace',
      asMember: true,
    });

    expect(errorMessage).toContain('does not have permission');
  });

  it('refuses a member without the Applications permission to share their own private connection', async () => {
    const errorMessage = await startAuthorizeAndGetErrorMessage({
      reconnectingConnectedAccountId: PRIVATE_OF_JONY_ID,
      visibility: 'workspace',
      asMember: true,
    });

    expect(errorMessage).toContain('does not have permission');
  });

  it('lets a member without the Applications permission reconnect their own private connection', async () => {
    const errorMessage = await startAuthorizeAndGetErrorMessage({
      reconnectingConnectedAccountId: PRIVATE_OF_JONY_ID,
      asMember: true,
    });

    expect(errorMessage).not.toContain('Cannot reconnect connectedAccount');
    expect(errorMessage).not.toContain('does not have permission');
  });

  describe('OAuth state', () => {
    it('sends the PKCE challenge but keeps the verifier out of the state', async () => {
      const { authorizationUrl, state, flowCookie } = await startPkceFlow();

      expect(authorizationUrl.searchParams.get('code_challenge')).toEqual(
        expect.any(String),
      );
      expect(authorizationUrl.searchParams.get('code_challenge_method')).toBe(
        'S256',
      );

      const statePayload = decodeJwtPayload(state);

      expect(statePayload).not.toHaveProperty('codeVerifier');
      expect(statePayload.jti).toEqual(expect.any(String));
      expect(flowCookie.split('=')[1]).toBe(statePayload.jti);
    });

    it('rejects a state replayed after its first callback', async () => {
      const { state, flowCookie } = await startPkceFlow();

      const firstErrorMessage = await callbackAndGetErrorMessage({
        state,
        flowCookie,
      });

      expect(firstErrorMessage).not.toContain('OAuth state');

      const replayErrorMessage = await callbackAndGetErrorMessage({
        state,
        flowCookie,
      });

      expect(replayErrorMessage).toContain(
        'OAuth state has already been used or has expired',
      );
    });

    it('rejects a callback that does not carry the flow cookie', async () => {
      const { state } = await startPkceFlow();

      const errorMessage = await callbackAndGetErrorMessage({ state });

      expect(errorMessage).toContain(
        'OAuth state was not issued to this browser',
      );
    });

    it('rejects a callback whose flow cookie belongs to another flow', async () => {
      const { state } = await startPkceFlow();
      const { flowCookie: otherFlowCookie } = await startPkceFlow();

      const errorMessage = await callbackAndGetErrorMessage({
        state,
        flowCookie: otherFlowCookie,
      });

      expect(errorMessage).toContain(
        'OAuth state was not issued to this browser',
      );
    });
  });
});
