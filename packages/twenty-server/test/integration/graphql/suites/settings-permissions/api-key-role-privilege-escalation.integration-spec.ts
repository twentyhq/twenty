import request from 'supertest';
import { deleteOneRoleOperationFactory } from 'test/integration/graphql/utils/delete-one-role-operation-factory.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { PermissionFlagType } from 'twenty-shared/constants';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

// A workspace member whose role only carries the API_KEYS_AND_WEBHOOKS flag must
// not be able to mint (or re-assign) an API key bound to a role that grants more
// permissions than the member itself holds. Otherwise the member could escalate
// to Admin through the API key token.
describe('API key role privilege escalation', () => {
  let customRoleId: string;
  let originalMemberRoleId: string;
  let adminRoleId: string;
  const createdApiKeyIds: string[] = [];

  beforeAll(async () => {
    const memberRole = await findOneRoleByLabel({ label: 'Member' });

    originalMemberRoleId = memberRole.id;

    const adminRole = await findOneRoleByLabel({ label: 'Admin' });

    adminRoleId = adminRole.id;

    const createRoleQuery = {
      query: `
        mutation CreateOneRole {
          createOneRole(createRoleInput: {
            label: "Api Key Escalation Test Role"
            description: "Role that only holds API_KEYS_AND_WEBHOOKS"
            canUpdateAllSettings: false
            canReadAllObjectRecords: true
            canUpdateAllObjectRecords: true
            canSoftDeleteAllObjectRecords: false
            canDestroyAllObjectRecords: false
          }) {
            id
          }
        }
      `,
    };

    const createRoleResponse = await client
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(createRoleQuery);

    customRoleId = createRoleResponse.body.data.createOneRole.id;

    const upsertPermissionFlagsQuery = {
      query: `
        mutation UpsertPermissionFlags {
          upsertPermissionFlags(upsertPermissionFlagsInput: {
            roleId: "${customRoleId}"
            permissionFlagKeys: ["${PermissionFlagType.API_KEYS_AND_WEBHOOKS}"]
          }) {
            id
          }
        }
      `,
    };

    await client
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(upsertPermissionFlagsQuery);

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
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        roleId: originalMemberRoleId,
      },
      expectToFail: false,
    });

    // Remove role targets first: deleting an apiKey row does not cascade to its
    // roleTarget, and a lingering roleTarget would block the role deletion.
    await testDataSource
      .query('DELETE FROM core."roleTarget" WHERE "roleId" = $1', [
        customRoleId,
      ])
      .catch(() => {});

    for (const apiKeyId of createdApiKeyIds) {
      await testDataSource
        .query('DELETE FROM core."apiKey" WHERE id = $1', [apiKeyId])
        .catch(() => {});
    }

    const deleteRoleQuery = deleteOneRoleOperationFactory(customRoleId);

    await client
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(deleteRoleQuery);
  });

  describe('createApiKey', () => {
    it('should deny minting an API key bound to a role that exceeds the caller permissions', async () => {
      const createApiKeyQuery = {
        query: `
          mutation CreateApiKey {
            createApiKey(input: {
              name: "escalation-key"
              expiresAt: "2027-01-01T00:00:00.000Z"
              roleId: "${adminRoleId}"
            }) {
              id
            }
          }
        `,
      };

      const response = await client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
        .send(createApiKeyQuery);

      if (response.body?.data?.createApiKey?.id) {
        createdApiKeyIds.push(response.body.data.createApiKey.id);
      }

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should allow minting an API key bound to a role within the caller permissions', async () => {
      const createApiKeyQuery = {
        query: `
          mutation CreateApiKey {
            createApiKey(input: {
              name: "legit-key"
              expiresAt: "2027-01-01T00:00:00.000Z"
              roleId: "${customRoleId}"
            }) {
              id
            }
          }
        `,
      };

      const response = await client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
        .send(createApiKeyQuery);

      const createdApiKeyId = response.body?.data?.createApiKey?.id;

      if (createdApiKeyId) {
        createdApiKeyIds.push(createdApiKeyId);
      }

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(createdApiKeyId).toBeDefined();
    });
  });

  describe('assignRoleToApiKey', () => {
    it('should deny re-assigning an API key to a role that exceeds the caller permissions', async () => {
      const createApiKeyQuery = {
        query: `
          mutation CreateApiKey {
            createApiKey(input: {
              name: "assign-escalation-key"
              expiresAt: "2027-01-01T00:00:00.000Z"
              roleId: "${customRoleId}"
            }) {
              id
            }
          }
        `,
      };

      const createResponse = await client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
        .send(createApiKeyQuery);

      const apiKeyId = createResponse.body.data.createApiKey.id;

      createdApiKeyIds.push(apiKeyId);

      const assignRoleQuery = {
        query: `
          mutation AssignRoleToApiKey {
            assignRoleToApiKey(
              apiKeyId: "${apiKeyId}"
              roleId: "${adminRoleId}"
            )
          }
        `,
      };

      const response = await client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
        .send(assignRoleQuery);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });
  });
});
