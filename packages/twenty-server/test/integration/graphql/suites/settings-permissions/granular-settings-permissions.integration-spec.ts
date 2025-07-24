import { print } from 'graphql';
import request from 'supertest';
import { deleteOneRoleOperationFactory } from 'test/integration/graphql/utils/delete-one-role-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { updateWorkspaceMemberRole } from 'test/integration/graphql/utils/update-workspace-member-role.util';
import { createOneObjectMetadataQueryFactory } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-query-factory.util';
import { deleteOneObjectMetadataQueryFactory } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata-query-factory.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

describe('Granular settings permissions', () => {
  let customRoleId: string;
  let originalMemberRoleId: string;

  beforeAll(async () => {
    // Get the original Member role ID for restoration later
    const getRolesQuery = {
      query: `
        query GetRoles {
          getRoles {
            id
            label
          }
        }
      `,
    };

    const rolesResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(getRolesQuery);

    originalMemberRoleId = rolesResponse.body.data.getRoles.find(
      (role: any) => role.label === 'Member',
    ).id;

    // Create a custom role with canUpdateAllSettings = false
    const createRoleQuery = {
      query: `
        mutation CreateOneRole {
          createOneRole(createRoleInput: {
            label: "Custom Test Role"
            description: "Role for testing specific setting permissions"
            canUpdateAllSettings: false
            canReadAllObjectRecords: true
            canUpdateAllObjectRecords: false
            canSoftDeleteAllObjectRecords: false
            canDestroyAllObjectRecords: false
          }) {
            id
            label
            canUpdateAllSettings
          }
        }
      `,
    };

    const createRoleResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(createRoleQuery);

    customRoleId = createRoleResponse.body.data.createOneRole.id;

    // Assign specific setting permissions to the custom role
    const upsertSettingPermissionsQuery = {
      query: `
        mutation UpsertPermissionFlags {
          upsertPermissionFlags(upsertPermissionFlagsInput: {
            roleId: "${customRoleId}"
            permissionFlagKeys: [${PermissionFlagType.DATA_MODEL}, ${PermissionFlagType.WORKSPACE}, ${PermissionFlagType.WORKFLOWS}]
          }) {
            id
            flag
            roleId
          }
        }
      `,
    };

    await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(upsertSettingPermissionsQuery);

    // Assign the custom role to JONY (who uses APPLE_JONY_MEMBER_ACCESS_TOKEN)
    await updateWorkspaceMemberRole({
      client,
      roleId: customRoleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });
  });

  afterAll(async () => {
    // Restore JONY's original Member role
    const restoreMemberRoleQuery = {
      query: `
        mutation UpdateWorkspaceMemberRole {
          updateWorkspaceMemberRole(
            workspaceMemberId: "${WORKSPACE_MEMBER_DATA_SEED_IDS.JONY}"
            roleId: "${originalMemberRoleId}"
          ) {
            id
          }
        }
      `,
    };

    await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(restoreMemberRoleQuery);

    // Delete the custom role
    const deleteRoleQuery = deleteOneRoleOperationFactory(customRoleId);

    await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(deleteRoleQuery);
  });

  describe('Data Model Permissions', () => {
    it('should allow access to data model operations when user has DATA_MODEL setting permission', async () => {
      // Test creating an object metadata (requires DATA_MODEL permission)
      const { query: createObjectQuery, variables } =
        createOneObjectMetadataQueryFactory({
          input: {
            labelSingular: 'House',
            labelPlural: 'Houses',
            nameSingular: 'house',
            namePlural: 'houses',
            description: 'a house',
            icon: 'IconHome',
          },
          gqlFields: `
          id
          labelSingular
          labelPlural
        `,
        });

      const response = await client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
        .send({ query: print(createObjectQuery), variables });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createOneObject).toBeDefined();
      expect(response.body.data.createOneObject.labelSingular).toBe('House');

      // Clean up - delete the created object
      const { query: deleteObjectQuery, variables: deleteObjectVariables } =
        deleteOneObjectMetadataQueryFactory({
          input: {
            idToDelete: response.body.data.createOneObject.id,
          },
          gqlFields: 'id',
        });

      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: print(deleteObjectQuery),
          variables: deleteObjectVariables,
        });
    });
  });

  describe('Workspace Permissions', () => {
    it('should allow access to workspace operations when user has WORKSPACE setting permission', async () => {
      // Test updating workspace settings (requires WORKSPACE permission)
      const updateWorkspaceQuery = {
        query: `
          mutation UpdateWorkspace {
            updateWorkspace(data: {
              displayName: "Updated Test Workspace"
            }) {
              id
              displayName
            }
          }
        `,
      };

      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
        .send(updateWorkspaceQuery);

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateWorkspace).toBeDefined();
      expect(response.body.data.updateWorkspace.displayName).toBe(
        'Updated Test Workspace',
      );

      // Restore original workspace name
      const restoreWorkspaceQuery = {
        query: `
          mutation UpdateWorkspace {
            updateWorkspace(data: {
              displayName: "Apple"
            }) {
              id
              displayName
            }
          }
        `,
      };

      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(restoreWorkspaceQuery);
    });
  });

  describe('Workflows Permissions', () => {
    it('should allow access to workflows operations when user has WORKFLOWS setting permission', async () => {
      // Test creating a workflow (requires WORKFLOWS permission)
      const createWorkflowQuery = {
        query: `
          mutation CreateWorkflow {
            createWorkflow(data: {
              name: "Test Workflow"
            }) {
              id
              name
            }
          }
        `,
      };

      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
        .send(createWorkflowQuery);

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createWorkflow).toBeDefined();
      expect(response.body.data.createWorkflow.name).toBe('Test Workflow');

      // Clean up - delete the created workflow
      const graphqlOperation = destroyOneOperationFactory({
        objectMetadataSingularName: 'workflow',
        gqlFields: `
            id
        `,
        recordId: response.body.data.createWorkflow.id,
      });

      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(graphqlOperation);
    });
  });

  describe('Denied Permissions', () => {
    it('should deny access to roles operations when user does not have ROLES setting permission', async () => {
      // Test creating a role (requires ROLES permission, which our custom role doesn't have)
      const createRoleQuery = {
        query: `
          mutation CreateOneRole {
            createOneRole(createRoleInput: {
              label: "Unauthorized Role"
            }) {
              id
            }
          }
        `,
      };

      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
        .send(createRoleQuery);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should deny access to workspace members operations when user does not have WORKSPACE_MEMBERS setting permission', async () => {
      // Test inviting a workspace member (requires WORKSPACE_MEMBERS permission)
      const inviteWorkspaceMemberQuery = {
        query: `
          mutation SendWorkspaceInvitation {
            sendInvitations(emails: ["test@example.com"]) {
              success
            }
          }
        `,
      };

      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
        .send(inviteWorkspaceMemberQuery);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should deny access to API keys operations when user does not have API_KEYS_AND_WEBHOOKS setting permission', async () => {
      // Test creating an API key (requires API_KEYS_AND_WEBHOOKS permission)
      const createApiKeyQuery = {
        query: `
          mutation GenerateApiKeyToken {
            generateApiKeyToken(apiKeyId: "setting-permissions-test-api-key-id", expiresAt: "2025-12-31T23:59:59.000Z") {
              token
            }
          }
        `,
      };

      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
        .send(createApiKeyQuery);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });
  });

  describe('Permission Inheritance', () => {
    it('should verify that canUpdateAllSettings=false is properly overridden by specific setting permissions', async () => {
      // Verify the role configuration
      const getRoleQuery = {
        query: `
          query GetRole {
            getRoles {
              id
              label
              canUpdateAllSettings
              permissionFlags {
                flag
              }
            }
          }
        `,
      };

      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(getRoleQuery);

      const customRole = response.body.data.getRoles.find(
        (role: any) => role.id === customRoleId,
      );

      expect(customRole).toBeDefined();
      expect(customRole.canUpdateAllSettings).toBe(false);
      expect(customRole.permissionFlags).toHaveLength(3);
      expect(customRole.permissionFlags.map((p: any) => p.flag)).toContain(
        PermissionFlagType.DATA_MODEL,
      );
      expect(customRole.permissionFlags.map((p: any) => p.flag)).toContain(
        PermissionFlagType.WORKSPACE,
      );
    });
  });

  describe('Dynamic Permission Updates', () => {
    it('should allow adding new setting permissions to existing role', async () => {
      // Add SECURITY permission to the custom role
      const upsertSecurityPermissionQuery = {
        query: `
          mutation UpsertPermissionFlags {
            upsertPermissionFlags(upsertPermissionFlagsInput: {
              roleId: "${customRoleId}"
              permissionFlagKeys: [${PermissionFlagType.DATA_MODEL}, ${PermissionFlagType.WORKSPACE}, ${PermissionFlagType.SECURITY}]
            }) {
              id
              flag
              roleId
            }
          }
        `,
      };

      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(upsertSecurityPermissionQuery);

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.upsertPermissionFlags).toHaveLength(3);

      // Verify the user now has access to security operations
      // Note: This would require a specific security operation to test
      // For now, we just verify the permission was added
      const getRoleQuery = {
        query: `
          query GetRole {
            getRoles {
              id
              permissionFlags {
                flag
              }
            }
          }
        `,
      };

      const roleResponse = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(getRoleQuery);

      const updatedRole = roleResponse.body.data.getRoles.find(
        (role: any) => role.id === customRoleId,
      );

      expect(updatedRole.permissionFlags).toHaveLength(3);
      expect(updatedRole.permissionFlags.map((p: any) => p.flag)).toContain(
        PermissionFlagType.SECURITY,
      );
    });

    it('should allow removing setting permissions from existing role', async () => {
      // Remove SECURITY permission, keep only DATA_MODEL and WORKSPACE
      const upsertReducedPermissionsQuery = {
        query: `
          mutation UpsertPermissionFlags {
            upsertPermissionFlags(upsertPermissionFlagsInput: {
              roleId: "${customRoleId}"
              permissionFlagKeys: [${PermissionFlagType.DATA_MODEL}, ${PermissionFlagType.WORKSPACE}]
            }) {
              id
              flag
              roleId
            }
          }
        `,
      };

      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(upsertReducedPermissionsQuery);

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.upsertPermissionFlags).toHaveLength(2);

      // Verify SECURITY permission was removed
      const getRoleQuery = {
        query: `
          query GetRole {
            getRoles {
              id
              permissionFlags {
                flag
              }
            }
          }
        `,
      };

      const roleResponse = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(getRoleQuery);

      const updatedRole = roleResponse.body.data.getRoles.find(
        (role: any) => role.id === customRoleId,
      );

      expect(updatedRole.permissionFlags).toHaveLength(2);
      expect(updatedRole.permissionFlags.map((p: any) => p.flag)).not.toContain(
        PermissionFlagType.SECURITY,
      );
    });
  });
});
