import { type ASTNode } from 'graphql';
import gql from 'graphql-tag';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getSharedTestRole } from 'test/integration/permissions/utils/get-shared-test-role.util';
import {
  SHARED_TEST_ROLES,
  type SharedTestRoleKey,
} from 'test/integration/permissions/utils/shared-test-roles.constant';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { isDefined } from 'twenty-shared/utils';

import { type AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { type RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { RANDOM_USER_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { RANDOM_WORKSPACE_MEMBER_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

export type TestPrincipalKind = 'user' | 'apiKey';

type RestApiRequestParams = Parameters<typeof makeRestApiRequest>[0];

export type TestPrincipal = {
  kind: TestPrincipalKind;
  graphql: (operation: {
    query: ASTNode;
    variables?: Record<string, unknown>;
  }) => ReturnType<typeof makeGraphqlApiRequest>;
  rest: (
    params: Omit<RestApiRequestParams, 'bearer'>,
  ) => ReturnType<typeof makeRestApiRequest>;
};

const API_KEY_EXPIRES_AT = '2099-01-01T00:00:00Z';

const sharedTestPrincipalPromisesByKey = new Map<
  string,
  Promise<TestPrincipal>
>();

const generateUserToken = async ({
  role,
  roleKey,
}: {
  role: RoleDTO;
  roleKey: SharedTestRoleKey;
}) => {
  const { randomUserIndex } = SHARED_TEST_ROLES[roleKey];
  const workspaceMemberId =
    RANDOM_WORKSPACE_MEMBER_IDS[`RANDOM_WORKSPACE_MEMBER_${randomUserIndex}`];

  const isAlreadyAssigned = (role.workspaceMembers ?? []).some(
    (workspaceMember) => workspaceMember.id === workspaceMemberId,
  );

  if (!isAlreadyAssigned) {
    await updateWorkspaceMemberRole({
      input: { workspaceMemberId, roleId: role.id },
      gqlFields: 'id',
      expectToFail: false,
    });
  }

  const { token } = await getAppProviderByClassName<AccessTokenService>(
    'AccessTokenService',
  ).generateAccessToken({
    userId: RANDOM_USER_IDS[`RANDOM_USER_${randomUserIndex}`],
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    authProvider: AuthProviderEnum.Password,
  });

  return token;
};

const generateApiKeyToken = async ({ role }: { role: RoleDTO }) => {
  let apiKeyId = role.apiKeys?.[0]?.id;

  if (!isDefined(apiKeyId)) {
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
          name: role.label,
          expiresAt: API_KEY_EXPIRES_AT,
          roleId: role.id,
        },
      },
    });

    apiKeyId = createApiKeyResponse.body.data.createApiKey.id as string;
  }

  const generateApiKeyTokenResponse = await makeMetadataApiRequest({
    query: gql`
      mutation GenerateApiKeyToken($apiKeyId: UUID!, $expiresAt: String!) {
        generateApiKeyToken(apiKeyId: $apiKeyId, expiresAt: $expiresAt) {
          token
        }
      }
    `,
    variables: { apiKeyId, expiresAt: API_KEY_EXPIRES_AT },
  });

  return generateApiKeyTokenResponse.body.data.generateApiKeyToken
    .token as string;
};

const createSharedTestPrincipal = async ({
  kind,
  roleKey,
}: {
  kind: TestPrincipalKind;
  roleKey: SharedTestRoleKey;
}): Promise<TestPrincipal> => {
  const role = await getSharedTestRole(roleKey);

  const token =
    kind === 'user'
      ? await generateUserToken({ role, roleKey })
      : await generateApiKeyToken({ role });

  return {
    kind,
    graphql: (operation) => makeGraphqlApiRequest(operation, token),
    rest: (params) => makeRestApiRequest({ ...params, bearer: token }),
  };
};

export const getSharedTestPrincipal = ({
  kind,
  roleKey,
}: {
  kind: TestPrincipalKind;
  roleKey: SharedTestRoleKey;
}): Promise<TestPrincipal> => {
  const principalKey = `${kind}:${roleKey}`;
  const existingPromise = sharedTestPrincipalPromisesByKey.get(principalKey);

  if (isDefined(existingPromise)) {
    return existingPromise;
  }

  const sharedTestPrincipalPromise = createSharedTestPrincipal({
    kind,
    roleKey,
  });

  sharedTestPrincipalPromisesByKey.set(
    principalKey,
    sharedTestPrincipalPromise,
  );

  return sharedTestPrincipalPromise;
};
