/* global APP_PORT */
import request from 'supertest';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { generateTransientToken } from 'test/integration/utils/generate-transient-token.util';
import { type Manifest } from 'twenty-shared/application';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const PROVIDER_NAME = 'linear';
const DUPLICATE_CONNECTION_MESSAGE =
  'You already have a connection for this provider';

const buildManifestWithConnectionProvider = ({
  appId,
  roleId,
  providerId,
}: {
  appId: string;
  roleId: string;
  providerId: string;
}): Manifest =>
  buildBaseManifest({
    appId,
    roleId,
    overrides: {
      connectionProviders: [
        {
          universalIdentifier: providerId,
          name: PROVIDER_NAME,
          displayName: 'Linear',
          type: 'oauth',
          oauth: {
            authorizationEndpoint: 'https://linear.app/oauth/authorize',
            tokenEndpoint: 'https://api.linear.app/oauth/token',
            scopes: ['read'],
            clientIdVariable: 'LINEAR_CLIENT_ID',
            clientSecretVariable: 'LINEAR_CLIENT_SECRET',
          },
        },
      ],
    },
  });

const authorize = async (query: Record<string, string>) =>
  request(`http://localhost:${APP_PORT}`)
    .get('/auth/apps/authorize')
    .query(query);

const getRedirectErrorMessage = (location: string): string | null =>
  new URL(location).searchParams.get('errorMessage');

describe('App OAuth authorize endpoint', () => {
  let appId: string;
  let roleId: string;
  let providerId: string;
  let applicationId: string;
  let connectedAccountId: string;

  const insertJaneConnectedAccount = async (): Promise<void> => {
    const [provider] = await findConnectionProvidersByApplication(appId);

    await globalThis.testDataSource.query(
      `INSERT INTO core."connectedAccount"
         (id, handle, provider, visibility, "workspaceId", "userWorkspaceId", "applicationId", "connectionProviderId")
       VALUES ($1, $2, $3, 'user', $4, $5, $6, $7)`,
      [
        connectedAccountId,
        'jane@apple.dev',
        ConnectedAccountProvider.APP,
        SEED_APPLE_WORKSPACE_ID,
        USER_WORKSPACE_DATA_SEED_IDS.JANE,
        provider.applicationId,
        provider.id,
      ],
    );
  };

  beforeEach(async () => {
    appId = uuidv4();
    roleId = uuidv4();
    providerId = uuidv4();
    connectedAccountId = uuidv4();

    await setupApplicationForSync({
      applicationUniversalIdentifier: appId,
      name: 'Test Application',
      description: 'App for testing the OAuth authorize endpoint',
      sourcePath: 'test-oauth-authorize',
    });
    jest.useRealTimers();

    await syncApplication({
      manifest: buildManifestWithConnectionProvider({
        appId,
        roleId,
        providerId,
      }),
      expectToFail: false,
    });

    const [provider] = await findConnectionProvidersByApplication(appId);

    applicationId = provider.applicationId;
  }, 60000);

  afterEach(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."connectedAccount" WHERE id = $1`,
      [connectedAccountId],
    );
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: appId,
    });
  });

  it('rejects a second connection for the same provider and user with a friendly message on the app page', async () => {
    await insertJaneConnectedAccount();

    const response = await authorize({
      applicationId,
      providerName: PROVIDER_NAME,
      transientToken: await generateTransientToken(),
      visibility: 'user',
    });

    expect(response.status).toBe(302);

    const location = new URL(response.headers.location);

    expect(location.pathname).toBe(`/settings/applications/${applicationId}`);
    expect(getRedirectErrorMessage(response.headers.location)).toContain(
      DUPLICATE_CONNECTION_MESSAGE,
    );
  }, 60000);

  it('lets the user reconnect their existing connection', async () => {
    await insertJaneConnectedAccount();

    const response = await authorize({
      applicationId,
      providerName: PROVIDER_NAME,
      transientToken: await generateTransientToken(),
      visibility: 'user',
      reconnectingConnectedAccountId: connectedAccountId,
    });

    expect(response.status).toBe(302);
    expect(getRedirectErrorMessage(response.headers.location)).not.toContain(
      DUPLICATE_CONNECTION_MESSAGE,
    );
  }, 60000);

  it('lets a user without a connection start the flow', async () => {
    const response = await authorize({
      applicationId,
      providerName: PROVIDER_NAME,
      transientToken: await generateTransientToken(),
      visibility: 'user',
    });

    expect(response.status).toBe(302);
    expect(getRedirectErrorMessage(response.headers.location)).not.toContain(
      DUPLICATE_CONNECTION_MESSAGE,
    );
  }, 60000);
});
