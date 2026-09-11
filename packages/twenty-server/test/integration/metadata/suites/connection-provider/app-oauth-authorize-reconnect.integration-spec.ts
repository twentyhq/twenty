import request from 'supertest';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { generateTransientToken } from 'test/integration/utils/generate-transient-token.util';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const APP_ID = uuidv4();
const APP_ROLE_ID = uuidv4();
const APP_PROVIDER_ID = uuidv4();

const SHARED_BY_TIM_ID = uuidv4();
const PRIVATE_OF_TIM_ID = uuidv4();

describe('app OAuth authorize reconnect guard (e2e)', () => {
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

  const startReconnectAndGetErrorMessage = async (
    reconnectingConnectedAccountId: string,
  ): Promise<string> => {
    const response = await request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/authorize')
      .query({
        applicationId: applicationDbId,
        providerName: 'slack',
        transientToken: await generateTransientToken(),
        reconnectingConnectedAccountId,
      });

    expect(response.status).toBe(302);

    return (
      new URL(response.headers.location).searchParams.get('errorMessage') ?? ''
    );
  };

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_ID,
      name: 'test-app-oauth-authorize-reconnect',
      description: 'App for testing the reconnect authorization guard',
      sourcePath: 'test-app-oauth-authorize-reconnect',
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
          ],
        },
      }),
      expectToFail: false,
    });

    jest.useRealTimers();

    const [provider] = await findConnectionProvidersByApplication(APP_ID);

    applicationDbId = provider.applicationId;
    providerDbId = provider.id;

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
    const errorMessage =
      await startReconnectAndGetErrorMessage(PRIVATE_OF_TIM_ID);

    expect(errorMessage).toContain(
      `Cannot reconnect connectedAccount ${PRIVATE_OF_TIM_ID}`,
    );
  });

  it('lets any member reconnect a workspace-shared connection', async () => {
    const errorMessage =
      await startReconnectAndGetErrorMessage(SHARED_BY_TIM_ID);

    expect(errorMessage).not.toContain('Cannot reconnect connectedAccount');
  });
});
