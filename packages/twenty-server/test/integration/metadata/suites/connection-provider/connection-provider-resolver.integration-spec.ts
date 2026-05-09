import { gql } from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type Manifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_PROVIDER_ID = uuidv4();

const buildManifest = (
  overrides?: Partial<Pick<Manifest, 'connectionProviders'>>,
) => buildBaseManifest({ appId: TEST_APP_ID, roleId: TEST_ROLE_ID, overrides });

const findApplicationDbId = async (
  universalIdentifier: string,
): Promise<string> => {
  const rows = await globalThis.testDataSource.query(
    `SELECT id FROM core."application" WHERE "universalIdentifier" = $1`,
    [universalIdentifier],
  );

  return rows[0].id;
};

describe('applicationConnectionProviders resolver (e2e)', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing the connectionProviders resolver',
      sourcePath: 'test-connection-provider-resolver',
    });

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
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('returns the provider with type read from the entity and oauth.scopes from oauthConfig', async () => {
    const applicationId = await findApplicationDbId(TEST_APP_ID);

    const response = await makeMetadataAPIRequest({
      query: gql`
        query ApplicationConnectionProviders($applicationId: UUID!) {
          applicationConnectionProviders(applicationId: $applicationId) {
            id
            applicationId
            type
            name
            displayName
            oauth {
              scopes
              isClientCredentialsConfigured
            }
          }
        }
      `,
      variables: { applicationId },
    });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();

    const providers = response.body.data.applicationConnectionProviders;

    expect(providers).toHaveLength(1);
    expect(providers[0]).toMatchObject({
      applicationId,
      type: 'oauth',
      name: 'linear',
      displayName: 'Linear',
      oauth: {
        scopes: ['read', 'write'],
        // The fixture registration's OAuth client_id / client_secret server
        // variables are not filled in by setupApplicationForSync, so the
        // resolver should report credentials as not configured.
        isClientCredentialsConfigured: false,
      },
    });
  }, 60000);

  it('returns an empty array when the application has no connection providers', async () => {
    await syncApplication({
      manifest: buildManifest({ connectionProviders: [] }),
      expectToFail: false,
    });

    const applicationId = await findApplicationDbId(TEST_APP_ID);

    const response = await makeMetadataAPIRequest({
      query: gql`
        query ApplicationConnectionProviders($applicationId: UUID!) {
          applicationConnectionProviders(applicationId: $applicationId) {
            id
          }
        }
      `,
      variables: { applicationId },
    });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.applicationConnectionProviders).toEqual([]);
  }, 60000);
});
