import gql from 'graphql-tag';
import { generateApiKeyToken } from 'test/integration/graphql/utils/generate-api-key-token.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { upsertPermissionFlags } from 'test/integration/metadata/suites/role-permission-flag/utils/upsert-permission-flags.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

type GraphqlResponse = {
  body: {
    data: { apiKeys?: unknown[] } | null;
    errors?: { message: string; extensions: { code: string } }[];
  };
};

// apiKeys sits behind SettingsPermissionGuard(API_KEYS_AND_WEBHOOKS) and
// accepts user, API key and application callers, so it probes every branch
const queryApiKeys = (token: string): Promise<GraphqlResponse> =>
  makeMetadataApiRequest(
    {
      query: gql`
        query ApiKeys {
          apiKeys {
            id
          }
        }
      `,
    },
    token,
  );

const expectAllowed = (response: GraphqlResponse) => {
  expect(response.body.errors).toBeUndefined();
  expect(Array.isArray(response.body.data?.apiKeys)).toBe(true);
};

const expectPermissionDenied = (response: GraphqlResponse) => {
  expect(response.body.data).toBeNull();
  expect(response.body.errors?.[0].message).toBe(
    PermissionsExceptionMessage.PERMISSION_DENIED,
  );
  expect(response.body.errors?.[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
};

const invalidateWorkspaceCache = (
  cacheKeyNames: Parameters<WorkspaceCacheService['invalidateAndRecompute']>[1],
) =>
  getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, cacheKeyNames);

const createApiKeyRole = async ({
  label,
  permissionFlagKeys,
}: {
  label: string;
  permissionFlagKeys: PermissionFlagType[];
}): Promise<string> => {
  const { data } = await createOneRole({
    expectToFail: false,
    input: {
      label,
      description: 'Role for settings permission resolution tests',
      icon: 'IconKey',
      canUpdateAllSettings: false,
      canAccessAllTools: false,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      canBeAssignedToUsers: false,
      canBeAssignedToAgents: false,
      canBeAssignedToApiKeys: true,
    },
  });

  const roleId = data?.createOneRole?.id;

  jestExpectToBeDefined(roleId);

  if (permissionFlagKeys.length > 0) {
    await upsertPermissionFlags({
      expectToFail: false,
      input: { roleId, permissionFlagKeys },
    });
  }

  return roleId;
};

const createApiKeyForRole = async ({
  name,
  roleId,
}: {
  name: string;
  roleId: string;
}): Promise<{ apiKeyId: string; token: string }> => {
  const createApiKeyResponse = await makeMetadataApiRequest({
    query: gql`
      mutation CreateApiKey($input: CreateApiKeyInput!) {
        createApiKey(input: $input) {
          id
        }
      }
    `,
    variables: {
      input: {
        name,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        roleId,
      },
    },
  });

  const apiKeyId: string | undefined =
    createApiKeyResponse.body.data?.createApiKey?.id;

  jestExpectToBeDefined(apiKeyId);

  const tokenResponse = await generateApiKeyToken({
    apiKeyId,
    accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  });

  const token: string | undefined =
    tokenResponse.body.data?.generateApiKeyToken?.token;

  jestExpectToBeDefined(token);

  return { apiKeyId, token };
};

const generateApplicationAccessToken = async ({
  applicationId,
  actingUser,
}: {
  applicationId: string;
  actingUser?: 'JANE' | 'JONY';
}): Promise<string> => {
  const { applicationAccessToken } = await generateApplicationTokenPair({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    applicationId,
    ...(isDefined(actingUser)
      ? {
          userId: USER_DATA_SEED_IDS[actingUser],
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS[actingUser],
        }
      : {}),
  });

  return applicationAccessToken.token;
};

describe('Settings permission resolution', () => {
  const createdRoleIds: string[] = [];
  const createdApiKeyIds: string[] = [];
  const createdApplications: ApplicationWithVariable[] = [];

  let grantedApiKeyToken: string;
  let deniedApiKeyToken: string;
  let unassignedApiKeyId: string;
  let unassignedApiKeyToken: string;

  let grantedApplication: ApplicationWithVariable;
  let deniedApplication: ApplicationWithVariable;
  let rolelessApplication: ApplicationWithVariable;

  beforeAll(async () => {
    const grantedRoleId = await createApiKeyRole({
      label: 'Settings resolution granted API key role',
      permissionFlagKeys: [PermissionFlagType.API_KEYS_AND_WEBHOOKS],
    });
    const deniedRoleId = await createApiKeyRole({
      label: 'Settings resolution denied API key role',
      permissionFlagKeys: [PermissionFlagType.WORKFLOWS],
    });

    createdRoleIds.push(grantedRoleId, deniedRoleId);

    const grantedApiKey = await createApiKeyForRole({
      name: 'Settings resolution granted key',
      roleId: grantedRoleId,
    });
    const deniedApiKey = await createApiKeyForRole({
      name: 'Settings resolution denied key',
      roleId: deniedRoleId,
    });
    const unassignedApiKey = await createApiKeyForRole({
      name: 'Settings resolution unassigned key',
      roleId: grantedRoleId,
    });

    createdApiKeyIds.push(
      grantedApiKey.apiKeyId,
      deniedApiKey.apiKeyId,
      unassignedApiKey.apiKeyId,
    );

    grantedApiKeyToken = grantedApiKey.token;
    deniedApiKeyToken = deniedApiKey.token;
    unassignedApiKeyId = unassignedApiKey.apiKeyId;
    unassignedApiKeyToken = unassignedApiKey.token;

    await globalThis.testDataSource.query(
      'DELETE FROM core."roleTarget" WHERE "apiKeyId" = $1',
      [unassignedApiKey.apiKeyId],
    );
    await invalidateWorkspaceCache(['apiKeyRoleMap']);

    grantedApplication = await setupApplicationWithVariable({
      name: 'Settings resolution granted app',
      variableKey: 'GRANTED',
      permissionFlagUniversalIdentifiers: [
        SystemPermissionFlag.API_KEYS_AND_WEBHOOKS,
      ],
    });
    deniedApplication = await setupApplicationWithVariable({
      name: 'Settings resolution denied app',
      variableKey: 'DENIED',
      permissionFlagUniversalIdentifiers: [SystemPermissionFlag.APPLICATIONS],
    });
    rolelessApplication = await setupApplicationWithVariable({
      name: 'Settings resolution roleless app',
      variableKey: 'ROLELESS',
      permissionFlagUniversalIdentifiers: [
        SystemPermissionFlag.API_KEYS_AND_WEBHOOKS,
      ],
    });

    createdApplications.push(
      grantedApplication,
      deniedApplication,
      rolelessApplication,
    );

    await globalThis.testDataSource.query(
      'UPDATE core."application" SET "defaultRoleId" = NULL WHERE id = $1',
      [rolelessApplication.id],
    );
    await invalidateWorkspaceCache(['flatApplicationMaps']);
  }, 120000);

  afterAll(async () => {
    for (const apiKeyId of createdApiKeyIds) {
      await makeMetadataApiRequest({
        query: gql`
          mutation RevokeApiKey($input: RevokeApiKeyInput!) {
            revokeApiKey(input: $input) {
              id
            }
          }
        `,
        variables: { input: { id: apiKeyId } },
      });
      await globalThis.testDataSource.query(
        'DELETE FROM core."apiKey" WHERE id = $1',
        [apiKeyId],
      );
    }

    await invalidateWorkspaceCache(['apiKeyMap', 'apiKeyRoleMap']);

    for (const roleId of createdRoleIds) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: roleId },
      });
    }

    for (const application of createdApplications) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: application.universalIdentifier,
      });
    }
  });

  describe('user session', () => {
    it('allows a user whose role can update all settings', async () => {
      expectAllowed(await queryApiKeys(APPLE_JANE_ADMIN_ACCESS_TOKEN));
    });

    it('denies a user whose role lacks the setting', async () => {
      expectPermissionDenied(
        await queryApiKeys(APPLE_JONY_MEMBER_ACCESS_TOKEN),
      );
    });
  });

  describe('API key', () => {
    it('allows a key whose role is assigned the setting', async () => {
      expectAllowed(await queryApiKeys(grantedApiKeyToken));
    });

    it('denies a key whose role is assigned other settings only', async () => {
      expectPermissionDenied(await queryApiKeys(deniedApiKeyToken));
    });

    it('rejects a key without any role', async () => {
      const response = await queryApiKeys(unassignedApiKeyToken);

      expect(response.body.data).toBeNull();
      expect(response.body.errors?.[0].message).toBe(
        `API key ${unassignedApiKeyId} has no role assigned`,
      );
    });
  });

  describe('application token without a user', () => {
    it('allows an application whose default role is assigned the setting', async () => {
      expectAllowed(
        await queryApiKeys(
          await generateApplicationAccessToken({
            applicationId: grantedApplication.id,
          }),
        ),
      );
    });

    it('denies an application whose default role lacks the setting', async () => {
      expectPermissionDenied(
        await queryApiKeys(
          await generateApplicationAccessToken({
            applicationId: deniedApplication.id,
          }),
        ),
      );
    });

    it('denies an application without a default role', async () => {
      expectPermissionDenied(
        await queryApiKeys(
          await generateApplicationAccessToken({
            applicationId: rolelessApplication.id,
          }),
        ),
      );
    });
  });

  describe('application acting for a user', () => {
    it('allows when both the user role and the application role grant the setting', async () => {
      expectAllowed(
        await queryApiKeys(
          await generateApplicationAccessToken({
            applicationId: grantedApplication.id,
            actingUser: 'JANE',
          }),
        ),
      );
    });

    it('denies an admin user when the application role lacks the setting', async () => {
      expectPermissionDenied(
        await queryApiKeys(
          await generateApplicationAccessToken({
            applicationId: deniedApplication.id,
            actingUser: 'JANE',
          }),
        ),
      );
    });

    it('denies when the application role grants the setting but the user role does not', async () => {
      expectPermissionDenied(
        await queryApiKeys(
          await generateApplicationAccessToken({
            applicationId: grantedApplication.id,
            actingUser: 'JONY',
          }),
        ),
      );
    });

    it('bounds the user by the user role alone when the application has no default role', async () => {
      expectAllowed(
        await queryApiKeys(
          await generateApplicationAccessToken({
            applicationId: rolelessApplication.id,
            actingUser: 'JANE',
          }),
        ),
      );
      expectPermissionDenied(
        await queryApiKeys(
          await generateApplicationAccessToken({
            applicationId: rolelessApplication.id,
            actingUser: 'JONY',
          }),
        ),
      );
    });
  });
});
