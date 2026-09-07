/* global APP_PORT */
import request from 'supertest';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  TEST_CONNECTION_PROVIDER_NAME,
  buildConnectionProviderManifest,
} from 'test/integration/metadata/suites/connection-provider/utils/build-connection-provider-manifest.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { insertAppConnectedAccount } from 'test/integration/metadata/suites/connection-provider/utils/insert-app-connected-account.util';
import { generateTransientToken } from 'test/integration/utils/generate-transient-token.util';
import { v4 as uuidv4 } from 'uuid';

import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const DUPLICATE_CONNECTION_MESSAGE =
  'You already have a connection for this provider';

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
  let connectionProviderId: string;
  let connectedAccountId: string;

  const insertJaneConnectedAccount = () =>
    insertAppConnectedAccount({
      id: connectedAccountId,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      applicationId,
      connectionProviderId,
      handle: 'jane@apple.dev',
    });

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
      manifest: buildConnectionProviderManifest({ appId, roleId, providerId }),
      expectToFail: false,
    });

    const [provider] = await findConnectionProvidersByApplication(appId);

    applicationId = provider.applicationId;
    connectionProviderId = provider.id;
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
      providerName: TEST_CONNECTION_PROVIDER_NAME,
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
      providerName: TEST_CONNECTION_PROVIDER_NAME,
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
      providerName: TEST_CONNECTION_PROVIDER_NAME,
      transientToken: await generateTransientToken(),
      visibility: 'user',
    });

    expect(response.status).toBe(302);
    expect(getRedirectErrorMessage(response.headers.location)).not.toContain(
      DUPLICATE_CONNECTION_MESSAGE,
    );
  }, 60000);

  it('ignores an archived connection when deciding whether the user is already connected', async () => {
    await insertJaneConnectedAccount();
    await globalThis.testDataSource.query(
      `UPDATE core."connectedAccount" SET "archivedAt" = NOW() WHERE id = $1`,
      [connectedAccountId],
    );

    const response = await authorize({
      applicationId,
      providerName: TEST_CONNECTION_PROVIDER_NAME,
      transientToken: await generateTransientToken(),
      visibility: 'user',
    });

    expect(response.status).toBe(302);
    expect(getRedirectErrorMessage(response.headers.location)).not.toContain(
      DUPLICATE_CONNECTION_MESSAGE,
    );
  }, 60000);
});
