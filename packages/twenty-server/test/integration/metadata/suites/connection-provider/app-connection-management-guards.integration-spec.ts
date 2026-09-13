import request from 'supertest';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { makeMetadataAPIRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';
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

const SHARED_BY_TIM_ID = uuidv4();
const PRIVATE_OF_TIM_ID = uuidv4();
const PRIVATE_OF_JONY_ID = uuidv4();
const SHARED_TO_DELETE_ID = uuidv4();

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
    const response = await makeMetadataAPIRequestWithMemberRole({
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

    return (
      new URL(response.headers.location).searchParams.get('errorMessage') ?? ''
    );
  };

  const deleteConnectedAccountAsMember = async (id: string) => {
    return makeMetadataAPIRequestWithMemberRole({
      query: gql`
        mutation DeleteConnectedAccount($id: UUID!) {
          deleteConnectedAccount(id: $id) {
            id
          }
        }
      `,
      variables: { id },
    });
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
    await insertAppConnection({
      id: SHARED_TO_DELETE_ID,
      visibility: 'workspace',
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

  it('lets a member without the Applications permission reconnect their own private connection', async () => {
    const errorMessage = await startAuthorizeAndGetErrorMessage({
      reconnectingConnectedAccountId: PRIVATE_OF_JONY_ID,
      asMember: true,
    });

    expect(errorMessage).not.toContain('Cannot reconnect connectedAccount');
    expect(errorMessage).not.toContain('does not have permission');
  });

  it('refuses a member without the Applications permission to delete a workspace-shared connection', async () => {
    const response = await deleteConnectedAccountAsMember(SHARED_TO_DELETE_ID);

    expect(response.body.errors[0].message).toContain(
      'does not have permission',
    );

    const [remaining] = await globalThis.testDataSource.query(
      `SELECT id FROM core."connectedAccount" WHERE id = $1`,
      [SHARED_TO_DELETE_ID],
    );

    expect(remaining).toBeDefined();
  });

  it('lets a member without the Applications permission delete their own private connection', async () => {
    const response = await deleteConnectedAccountAsMember(PRIVATE_OF_JONY_ID);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteConnectedAccount.id).toBe(
      PRIVATE_OF_JONY_ID,
    );
  });
});
