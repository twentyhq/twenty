import request from 'supertest';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { generateTransientTokenResponse } from 'test/integration/utils/generate-transient-token.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { plaintextStringSchema } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const APP_ID = uuidv4();
const APP_ROLE_ID = uuidv4();
const APP_PROVIDER_ID = uuidv4();

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

  const startAuthorization = async ({
    reconnectingConnectedAccountId,
    visibility,
    isMember = false,
  }: {
    reconnectingConnectedAccountId?: string;
    visibility?: 'user' | 'workspace';
    isMember?: boolean;
  }): Promise<URL> => {
    const transient = await generateTransientTokenResponse({
      token: isMember
        ? APPLE_JONY_MEMBER_ACCESS_TOKEN
        : APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });
    const response = await request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/authorize')
      .query({
        applicationId: applicationDbId,
        providerName: 'slack',
        transientToken:
          transient.data.generateTransientToken.transientToken.token,
        ...(isDefined(reconnectingConnectedAccountId)
          ? { reconnectingConnectedAccountId }
          : {}),
        ...(isDefined(visibility) ? { visibility } : {}),
      });

    expect(response.status).toBe(302);

    return new URL(response.headers.location);
  };

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
          ],
        },
      }),
      expectToFail: false,
    });

    jest.useRealTimers();

    const [provider] = await findConnectionProvidersByApplication(APP_ID);

    applicationDbId = provider.applicationId;
    providerDbId = provider.id;

    const encryption = getAppProviderByClassName<SecretEncryptionService>(
      'SecretEncryptionService',
    );

    for (const key of ['SLACK_CLIENT_ID', 'SLACK_CLIENT_SECRET']) {
      await globalThis.testDataSource.query(
        `INSERT INTO core."applicationRegistrationVariable" (key, "encryptedValue", "applicationRegistrationId")
         SELECT $1, $2, "applicationRegistrationId" FROM core.application WHERE id = $3`,
        [
          key,
          encryption.encryptVersioned(
            plaintextStringSchema.parse(`test-${key}`),
          ),
          applicationDbId,
        ],
      );
    }

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
    const redirect = await startAuthorization({
      reconnectingConnectedAccountId: PRIVATE_OF_TIM_ID,
    });

    expect(redirect.searchParams.get('errorMessage')).toContain(
      'Not authorized to access this OAuth provider.',
    );
  });

  it('lets a member with the Applications permission reconnect a workspace-shared connection', async () => {
    const redirect = await startAuthorization({
      reconnectingConnectedAccountId: SHARED_BY_TIM_ID,
    });

    expect(redirect.origin).toBe('https://slack.com');
    expect(redirect.pathname).toBe('/oauth/v2/authorize');
    expect(redirect.searchParams.get('errorMessage')).toBeNull();
  });

  it('refuses a member without the Applications permission to reconnect a workspace-shared connection', async () => {
    const redirect = await startAuthorization({
      reconnectingConnectedAccountId: SHARED_BY_TIM_ID,
      isMember: true,
    });

    expect(redirect.searchParams.get('errorMessage')).toContain(
      'does not have permission',
    );
  });

  it('refuses a member without the Applications permission to create a workspace-shared connection', async () => {
    const redirect = await startAuthorization({
      visibility: 'workspace',
      isMember: true,
    });

    expect(redirect.searchParams.get('errorMessage')).toContain(
      'does not have permission',
    );
  });

  it('refuses a member without the Applications permission to share their own private connection', async () => {
    const redirect = await startAuthorization({
      reconnectingConnectedAccountId: PRIVATE_OF_JONY_ID,
      visibility: 'workspace',
      isMember: true,
    });

    expect(redirect.searchParams.get('errorMessage')).toContain(
      'does not have permission',
    );
  });

  it('lets a member without the Applications permission reconnect their own private connection', async () => {
    const redirect = await startAuthorization({
      reconnectingConnectedAccountId: PRIVATE_OF_JONY_ID,
      isMember: true,
    });

    expect(redirect.origin).toBe('https://slack.com');
    expect(redirect.pathname).toBe('/oauth/v2/authorize');
    expect(redirect.searchParams.get('errorMessage')).toBeNull();
  });
});
