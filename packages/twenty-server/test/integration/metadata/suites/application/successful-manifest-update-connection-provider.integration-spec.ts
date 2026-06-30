import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { type Manifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_PROVIDER_ID = uuidv4();
const TEST_SECOND_PROVIDER_ID = uuidv4();

const buildManifest = (
  overrides?: Partial<Pick<Manifest, 'connectionProviders'>>,
) => buildBaseManifest({ appId: TEST_APP_ID, roleId: TEST_ROLE_ID, overrides });

describe('Manifest update - connection providers', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing connection-provider manifest updates',
      sourcePath: 'test-manifest-update-connection-provider',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should create a new connection provider when added to manifest on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({ connectionProviders: [] }),
      expectToFail: false,
    });

    const providersAfterFirstSync =
      await findConnectionProvidersByApplication(TEST_APP_ID);

    expect(providersAfterFirstSync).toHaveLength(0);

    await syncApplication({
      manifest: buildManifest({
        connectionProviders: [
          {
            universalIdentifier: TEST_PROVIDER_ID,
            name: 'linear',
            displayName: 'Linear',
            type: 'oauth',
            oauth: {
              authorizationEndpoint: 'https://linear.app/oauth/authorize',
              tokenEndpoint: 'https://api.linear.app/oauth/token',
              scopes: ['read', 'write'],
              clientIdVariable: 'LINEAR_CLIENT_ID',
              clientSecretVariable: 'LINEAR_CLIENT_SECRET',
            },
          },
        ],
      }),
      expectToFail: false,
    });

    const providersAfterSecondSync =
      await findConnectionProvidersByApplication(TEST_APP_ID);

    expect(providersAfterSecondSync).toHaveLength(1);
    expect(providersAfterSecondSync[0]).toMatchObject({
      universalIdentifier: TEST_PROVIDER_ID,
      name: 'linear',
      displayName: 'Linear',
      type: 'oauth',
      oauthConfig: {
        authorizationEndpoint: 'https://linear.app/oauth/authorize',
        tokenEndpoint: 'https://api.linear.app/oauth/token',
        revokeEndpoint: null,
        scopes: ['read', 'write'],
        clientIdVariable: 'LINEAR_CLIENT_ID',
        clientSecretVariable: 'LINEAR_CLIENT_SECRET',
        authorizationParams: null,
        tokenRequestContentType: 'json',
        usePkce: true,
      },
    });
  }, 60000);

  it('should update oauthConfig fields when manifest changes on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({
        connectionProviders: [
          {
            universalIdentifier: TEST_PROVIDER_ID,
            name: 'linear',
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
      }),
      expectToFail: false,
    });

    const providersAfterFirstSync =
      await findConnectionProvidersByApplication(TEST_APP_ID);

    expect(providersAfterFirstSync).toHaveLength(1);
    expect(providersAfterFirstSync[0].oauthConfig?.scopes).toEqual(['read']);
    expect(providersAfterFirstSync[0].oauthConfig?.usePkce).toBe(true);

    await syncApplication({
      manifest: buildManifest({
        connectionProviders: [
          {
            universalIdentifier: TEST_PROVIDER_ID,
            name: 'linear',
            displayName: 'Linear (renamed)',
            type: 'oauth',
            oauth: {
              authorizationEndpoint: 'https://linear.app/oauth/authorize',
              tokenEndpoint: 'https://api.linear.app/oauth/token',
              revokeEndpoint: 'https://api.linear.app/oauth/revoke',
              scopes: ['read', 'write', 'admin'],
              clientIdVariable: 'LINEAR_CLIENT_ID',
              clientSecretVariable: 'LINEAR_CLIENT_SECRET',
              authorizationParams: { prompt: 'consent' },
              tokenRequestContentType: 'form-urlencoded',
              usePkce: false,
            },
          },
        ],
      }),
      expectToFail: false,
    });

    const providersAfterSecondSync =
      await findConnectionProvidersByApplication(TEST_APP_ID);

    expect(providersAfterSecondSync).toHaveLength(1);
    expect(providersAfterSecondSync[0]).toMatchObject({
      universalIdentifier: TEST_PROVIDER_ID,
      displayName: 'Linear (renamed)',
      oauthConfig: {
        revokeEndpoint: 'https://api.linear.app/oauth/revoke',
        scopes: ['read', 'write', 'admin'],
        authorizationParams: { prompt: 'consent' },
        tokenRequestContentType: 'form-urlencoded',
        usePkce: false,
      },
    });
  }, 60000);

  it('should delete a connection provider when removed from manifest on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({
        connectionProviders: [
          {
            universalIdentifier: TEST_PROVIDER_ID,
            name: 'linear',
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
          {
            universalIdentifier: TEST_SECOND_PROVIDER_ID,
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
      }),
      expectToFail: false,
    });

    const providersAfterFirstSync =
      await findConnectionProvidersByApplication(TEST_APP_ID);

    expect(providersAfterFirstSync).toHaveLength(2);
    expect(providersAfterFirstSync.map((p) => p.name).sort()).toEqual([
      'linear',
      'slack',
    ]);

    await syncApplication({
      manifest: buildManifest({
        connectionProviders: [
          {
            universalIdentifier: TEST_PROVIDER_ID,
            name: 'linear',
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
      }),
      expectToFail: false,
    });

    const providersAfterSecondSync =
      await findConnectionProvidersByApplication(TEST_APP_ID);

    expect(providersAfterSecondSync).toHaveLength(1);
    expect(providersAfterSecondSync[0].name).toBe('linear');
  }, 60000);

  it('should hard-delete connection providers (no soft-delete behaviour)', async () => {
    await syncApplication({
      manifest: buildManifest({
        connectionProviders: [
          {
            universalIdentifier: TEST_PROVIDER_ID,
            name: 'linear',
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
      }),
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildManifest({ connectionProviders: [] }),
      expectToFail: false,
    });

    // Bypass the helper's `JOIN application` so a soft-deleted row would
    // still surface here if it existed.
    const rawRows = await globalThis.testDataSource.query(
      `SELECT id FROM core."connectionProvider" WHERE "universalIdentifier" = $1`,
      [TEST_PROVIDER_ID],
    );

    expect(rawRows).toHaveLength(0);
  }, 60000);
});
