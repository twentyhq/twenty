import gql from 'graphql-tag';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { SystemPermissionFlag } from 'twenty-shared/constants';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const generateApplicationAccessToken = async (
  applicationId: string,
): Promise<string> => {
  const { applicationAccessToken } = await generateApplicationTokenPair({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    applicationId,
  });

  return applicationAccessToken.token;
};

const createApiKey = ({
  roleId,
  token,
}: {
  roleId: string;
  token: string;
}) =>
  makeMetadataApiRequest(
    {
      query: gql`
        mutation CreateApiKey($input: CreateApiKeyInput!) {
          createApiKey(input: $input) {
            id
            name
          }
        }
      `,
      variables: {
        input: {
          name: 'Application managed key',
          expiresAt: '2099-01-01T00:00:00Z',
          roleId,
        },
      },
    },
    token,
  );

describe('API key management by an application', () => {
  const createdApiKeyIds: string[] = [];

  let adminRoleId: string;
  let reassignedRoleId: string;
  let managingApplication: ApplicationWithVariable;
  let applicationWithoutRolesFlag: ApplicationWithVariable;
  let managingApplicationToken: string;

  const createApiKeyAsManagingApplication = async (): Promise<string> => {
    const response = await createApiKey({
      roleId: adminRoleId,
      token: managingApplicationToken,
    });

    expect(response.body.errors).toBeUndefined();

    const apiKeyId: string | undefined = response.body.data?.createApiKey?.id;

    jestExpectToBeDefined(apiKeyId);
    createdApiKeyIds.push(apiKeyId);

    return apiKeyId;
  };

  beforeAll(async () => {
    adminRoleId = (await findOneRoleByLabel({ label: 'Admin' })).id;

    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Application managed API key role',
        canUpdateAllSettings: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToApiKeys: true,
      },
    });

    const roleId = data?.createOneRole?.id;

    jestExpectToBeDefined(roleId);
    reassignedRoleId = roleId;

    managingApplication = await setupApplicationWithVariable({
      name: 'API key managing app',
      variableKey: 'MANAGING',
      permissionFlagUniversalIdentifiers: [
        SystemPermissionFlag.API_KEYS_AND_WEBHOOKS,
        SystemPermissionFlag.ROLES,
      ],
    });
    applicationWithoutRolesFlag = await setupApplicationWithVariable({
      name: 'API key app without roles flag',
      variableKey: 'WITHOUT_ROLES',
      permissionFlagUniversalIdentifiers: [
        SystemPermissionFlag.API_KEYS_AND_WEBHOOKS,
      ],
    });

    managingApplicationToken = await generateApplicationAccessToken(
      managingApplication.id,
    );
  }, 120000);

  afterAll(async () => {
    for (const apiKeyId of createdApiKeyIds) {
      await globalThis.testDataSource.query(
        'DELETE FROM core."roleTarget" WHERE "apiKeyId" = $1',
        [apiKeyId],
      );
      await globalThis.testDataSource.query(
        'DELETE FROM core."apiKey" WHERE id = $1',
        [apiKeyId],
      );
    }

    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'apiKeyMap',
      'apiKeyRoleMap',
    ]);

    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: reassignedRoleId },
    });

    for (const application of [
      managingApplication,
      applicationWithoutRolesFlag,
    ]) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: application.universalIdentifier,
      });
    }
  });

  it('creates an API key', async () => {
    const apiKeyId = await createApiKeyAsManagingApplication();

    const response = await makeMetadataApiRequest(
      {
        query: gql`
          query GetApiKey($input: GetApiKeyInput!) {
            apiKey(input: $input) {
              id
              role {
                id
              }
            }
          }
        `,
        variables: { input: { id: apiKeyId } },
      },
      managingApplicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.apiKey.role.id).toBe(adminRoleId);
  });

  it('renames an API key', async () => {
    const apiKeyId = await createApiKeyAsManagingApplication();

    const response = await makeMetadataApiRequest(
      {
        query: gql`
          mutation UpdateApiKey($input: UpdateApiKeyInput!) {
            updateApiKey(input: $input) {
              name
            }
          }
        `,
        variables: { input: { id: apiKeyId, name: 'Renamed by application' } },
      },
      managingApplicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateApiKey.name).toBe('Renamed by application');
  });

  it('assigns another role to an API key', async () => {
    const apiKeyId = await createApiKeyAsManagingApplication();

    const response = await makeMetadataApiRequest(
      {
        query: gql`
          mutation AssignRoleToApiKey($apiKeyId: UUID!, $roleId: UUID!) {
            assignRoleToApiKey(apiKeyId: $apiKeyId, roleId: $roleId)
          }
        `,
        variables: { apiKeyId, roleId: reassignedRoleId },
      },
      managingApplicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.assignRoleToApiKey).toBe(true);
  });

  it('revokes an API key', async () => {
    const apiKeyId = await createApiKeyAsManagingApplication();

    const response = await makeMetadataApiRequest(
      {
        query: gql`
          mutation RevokeApiKey($input: RevokeApiKeyInput!) {
            revokeApiKey(input: $input) {
              revokedAt
            }
          }
        `,
        variables: { input: { id: apiKeyId } },
      },
      managingApplicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.revokeApiKey.revokedAt).not.toBeNull();
  });

  it('creates an API key over REST', async () => {
    const response = await makeRestApiRequest({
      method: 'post',
      path: '/metadata/apiKeys',
      bearer: managingApplicationToken,
      body: {
        name: 'Application managed REST key',
        expiresAt: '2099-01-01T00:00:00Z',
        roleId: adminRoleId,
      },
    });

    if (typeof response.body?.id === 'string') {
      createdApiKeyIds.push(response.body.id);
    }

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Application managed REST key');
  });

  it('denies creating an API key when the application role lacks ROLES', async () => {
    const response = await createApiKey({
      roleId: adminRoleId,
      token: await generateApplicationAccessToken(
        applicationWithoutRolesFlag.id,
      ),
    });

    expect(response.body.data?.createApiKey ?? null).toBeNull();
    expect(response.body.errors?.[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });
});
