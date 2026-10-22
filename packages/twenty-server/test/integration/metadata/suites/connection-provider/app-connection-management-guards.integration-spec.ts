import request from 'supertest';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { upsertPermissionFlags } from 'test/integration/metadata/suites/role-permission-flag/utils/upsert-permission-flags.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { makeMetadataApiRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';
import {
  generateTransientToken,
  generateTransientTokenResponse,
} from 'test/integration/utils/generate-transient-token.util';
import { getDataOrThrow } from 'test/integration/utils/query-messaging.util';
import gql from 'graphql-tag';
import { PermissionFlagType } from 'twenty-shared/constants';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const APP_ID = uuidv4();
const APP_ROLE_ID = uuidv4();
const APP_PROVIDER_ID = uuidv4();
const APP_PERSONAL_PROVIDER_ID = uuidv4();

const SHARED_BY_TIM_ID = uuidv4();
const PRIVATE_OF_TIM_ID = uuidv4();
const PRIVATE_OF_JONY_ID = uuidv4();
const PRIVATE_OF_PHIL_ID = uuidv4();

describe('app connection management guards (e2e)', () => {
  let applicationDbId: string;
  let providerDbId: string;
  let personalProviderDbId: string;

  const insertAppConnection = async ({
    id,
    scope,
    userWorkspaceId,
    connectionProviderId = providerDbId,
  }: {
    id: string;
    scope: 'USER' | 'WORKSPACE';
    userWorkspaceId: string;
    connectionProviderId?: string;
  }): Promise<void> => {
    await globalThis.testDataSource.query(
      `INSERT INTO core."connectedAccount"
         (id, handle, provider, scope, "workspaceId", "userWorkspaceId",
          "applicationId", "connectionProviderId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        'slack-bot@apple.dev',
        ConnectedAccountProvider.APP,
        scope,
        SEED_APPLE_WORKSPACE_ID,
        userWorkspaceId,
        applicationDbId,
        connectionProviderId,
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

  const generateGuestTransientToken = async (): Promise<string> => {
    const { data, errors } = await generateTransientTokenResponse({
      token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
    });

    expect(errors).toBeUndefined();

    return data.generateTransientToken.transientToken.token;
  };

  const transientTokenGenerators = {
    admin: generateTransientToken,
    member: generateMemberTransientToken,
    guest: generateGuestTransientToken,
  };

  const startAuthorizeAndGetErrorMessage = async ({
    reconnectingConnectedAccountId,
    as = 'admin',
    providerName = 'slack',
  }: {
    reconnectingConnectedAccountId?: string;
    as?: keyof typeof transientTokenGenerators;
    providerName?: string;
  }): Promise<string> => {
    const response = await request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/authorize')
      .query({
        applicationId: applicationDbId,
        providerName,
        transientToken: await transientTokenGenerators[as](),
        ...(isDefined(reconnectingConnectedAccountId)
          ? { reconnectingConnectedAccountId }
          : {}),
      });

    expect(response.status).toBe(302);

    return (
      new URL(response.headers.location).searchParams.get('errorMessage') ?? ''
    );
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
            {
              universalIdentifier: APP_PERSONAL_PROVIDER_ID,
              name: 'slack-personal',
              displayName: 'Slack (personal)',
              type: 'oauth',
              scope: 'USER',
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

    const providers = await findConnectionProvidersByApplication(APP_ID);
    const provider = providers.find(({ name }) => name === 'slack');
    const personalProvider = providers.find(
      ({ name }) => name === 'slack-personal',
    );

    assertIsDefinedOrThrow(provider);
    assertIsDefinedOrThrow(personalProvider);

    applicationDbId = provider.applicationId;
    providerDbId = provider.id;
    personalProviderDbId = personalProvider.id;

    await insertAppConnection({
      id: SHARED_BY_TIM_ID,
      scope: 'WORKSPACE',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
    });
    await insertAppConnection({
      id: PRIVATE_OF_TIM_ID,
      scope: 'USER',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
      connectionProviderId: personalProviderDbId,
    });
    await insertAppConnection({
      id: PRIVATE_OF_JONY_ID,
      scope: 'USER',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
      connectionProviderId: personalProviderDbId,
    });
    await insertAppConnection({
      id: PRIVATE_OF_PHIL_ID,
      scope: 'USER',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.PHIL,
      connectionProviderId: personalProviderDbId,
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
      providerName: 'slack-personal',
    });

    expect(errorMessage).toContain(
      `Cannot reconnect connectedAccount ${PRIVATE_OF_TIM_ID}`,
    );
  });

  it('lets a member with the Workspace Apps permission reconnect a workspace-shared connection', async () => {
    const errorMessage = await startAuthorizeAndGetErrorMessage({
      reconnectingConnectedAccountId: SHARED_BY_TIM_ID,
    });

    expect(errorMessage).not.toContain('Cannot reconnect connectedAccount');
    expect(errorMessage).not.toContain('does not have permission');
  });

  it('refuses a member without the Workspace Apps permission to reconnect a workspace-shared connection', async () => {
    const errorMessage = await startAuthorizeAndGetErrorMessage({
      reconnectingConnectedAccountId: SHARED_BY_TIM_ID,
      as: 'member',
    });

    expect(errorMessage).toContain('does not have permission');
  });

  it('refuses a member without the Workspace Apps permission to create a workspace-shared connection', async () => {
    const errorMessage = await startAuthorizeAndGetErrorMessage({
      as: 'member',
    });

    expect(errorMessage).toContain('does not have permission');
  });

  it('lets a member without the Workspace Apps permission reconnect their own private connection', async () => {
    const errorMessage = await startAuthorizeAndGetErrorMessage({
      reconnectingConnectedAccountId: PRIVATE_OF_JONY_ID,
      as: 'member',
      providerName: 'slack-personal',
    });

    expect(errorMessage).not.toContain('Cannot reconnect connectedAccount');
    expect(errorMessage).not.toContain('does not have permission');
  });

  it('refuses a guest without the Connected accounts permission to reconnect their own private connection', async () => {
    const errorMessage = await startAuthorizeAndGetErrorMessage({
      reconnectingConnectedAccountId: PRIVATE_OF_PHIL_ID,
      as: 'guest',
      providerName: 'slack-personal',
    });

    expect(errorMessage).toContain('does not have permission');
  });

  describe('with the Applications permission and without the Connected accounts permission', () => {
    let memberRoleId: string;
    let applicationsOnlyRoleId: string;

    beforeAll(async () => {
      memberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

      const { data } = await createOneRole({
        expectToFail: false,
        input: {
          label: 'App connection guards applications only',
          canUpdateAllSettings: false,
          canAccessAllTools: false,
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
        },
      });

      applicationsOnlyRoleId = data.createOneRole.id;

      await upsertPermissionFlags({
        expectToFail: false,
        input: {
          roleId: applicationsOnlyRoleId,
          permissionFlagKeys: [PermissionFlagType.APPLICATIONS],
        },
      });

      await updateWorkspaceMemberRole({
        expectToFail: false,
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          roleId: applicationsOnlyRoleId,
        },
      });
    }, 60000);

    afterAll(async () => {
      await updateWorkspaceMemberRole({
        expectToFail: false,
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          roleId: memberRoleId,
        },
      });

      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: applicationsOnlyRoleId },
      });
    }, 60000);

    it('lets the member reconnect a workspace-shared connection', async () => {
      const errorMessage = await startAuthorizeAndGetErrorMessage({
        reconnectingConnectedAccountId: SHARED_BY_TIM_ID,
        as: 'member',
      });

      expect(errorMessage).not.toContain('Cannot reconnect connectedAccount');
      expect(errorMessage).not.toContain('does not have permission');
    });

    it('refuses the member to reconnect their own private connection', async () => {
      const errorMessage = await startAuthorizeAndGetErrorMessage({
        reconnectingConnectedAccountId: PRIVATE_OF_JONY_ID,
        as: 'member',
        providerName: 'slack-personal',
      });

      expect(errorMessage).toContain('does not have permission');
    });
  });
});
