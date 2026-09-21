import gql from 'graphql-tag';
import request from 'supertest';
import { deleteOneRoleOperationFactory } from 'test/integration/graphql/utils/delete-one-role-operation-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { PermissionFlagType } from 'twenty-shared/constants';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

describe('API key role assignment permission', () => {
  let customRoleId: string;
  let adminRoleId: string;
  let originalMemberRoleId: string;
  let apiKeyId: string;

  const createApiKeyAsJony = (roleId: string) =>
    makeMetadataAPIRequest(
      {
        query: gql`
          mutation CreateApiKey($input: CreateApiKeyInput!) {
            createApiKey(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            name: 'Escalation attempt',
            expiresAt: '2099-01-01T00:00:00Z',
            roleId,
          },
        },
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

  beforeAll(async () => {
    originalMemberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;
    adminRoleId = (await findOneRoleByLabel({ label: 'Admin' })).id;

    const createRoleResponse = await makeMetadataAPIRequest({
      query: gql`
        mutation CreateOneRole {
          createOneRole(
            createRoleInput: {
              label: "Api Keys Only Role"
              canUpdateAllSettings: false
              canReadAllObjectRecords: true
              canUpdateAllObjectRecords: true
              canSoftDeleteAllObjectRecords: false
              canDestroyAllObjectRecords: false
            }
          ) {
            id
          }
        }
      `,
    });

    customRoleId = createRoleResponse.body.data.createOneRole.id;

    await makeMetadataAPIRequest({
      query: gql`
        mutation UpsertPermissionFlags {
          upsertPermissionFlags(
            upsertPermissionFlagsInput: {
              roleId: "${customRoleId}"
              permissionFlagKeys: ["${PermissionFlagType.API_KEYS_AND_WEBHOOKS}"]
            }
          ) {
            id
          }
        }
      `,
    });

    const createApiKeyResponse = await makeMetadataAPIRequest({
      query: gql`
        mutation CreateApiKey($input: CreateApiKeyInput!) {
          createApiKey(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          name: 'Seed key',
          expiresAt: '2099-01-01T00:00:00Z',
          roleId: adminRoleId,
        },
      },
    });

    apiKeyId = createApiKeyResponse.body.data.createApiKey.id;

    await updateWorkspaceMemberRole({
      input: {
        roleId: customRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
      expectToFail: false,
    });
  });

  afterAll(async () => {
    await updateWorkspaceMemberRole({
      input: {
        roleId: originalMemberRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
      expectToFail: false,
    });

    await testDataSource
      .query('DELETE FROM core."apiKey" WHERE id = $1', [apiKeyId])
      .catch(() => {});

    await client
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(deleteOneRoleOperationFactory(customRoleId));
  });

  it('denies creating an API key with the Admin role when the caller lacks ROLES permission', async () => {
    const response = await createApiKeyAsJony(adminRoleId);

    expect(response.body.data?.createApiKey ?? null).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('denies assigning a role to an API key when the caller lacks ROLES permission', async () => {
    const response = await makeMetadataAPIRequest(
      {
        query: gql`
          mutation AssignRoleToApiKey($apiKeyId: UUID!, $roleId: UUID!) {
            assignRoleToApiKey(apiKeyId: $apiKeyId, roleId: $roleId)
          }
        `,
        variables: { apiKeyId, roleId: adminRoleId },
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });
});
