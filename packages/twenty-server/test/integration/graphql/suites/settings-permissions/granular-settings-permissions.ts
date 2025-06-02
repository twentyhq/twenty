import { print } from 'graphql';
import request from 'supertest';
import { deleteOneRoleOperationFactory } from 'test/integration/graphql/utils/delete-one-role-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';
import { createOneObjectMetadataQueryFactory } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-query-factory.util';
import { deleteOneObjectMetadataQueryFactory } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata-query-factory.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/database/typeorm-seeds/core/workspaces';
import { DEV_SEED_WORKSPACE_MEMBER_IDS } from 'src/database/typeorm-seeds/workspace/workspace-members';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

const client = request(`http://localhost:${APP_PORT}`);

describe('Granular settings permissions', () => {
  let customRoleId: string;
  let originalMemberRoleId: string;

  beforeAll(async () => {
    // Enable Permissions V2
    const enablePermissionsV2Query = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      'IS_PERMISSIONS_V2_ENABLED',
      true,
    );

    await makeGraphqlAPIRequest(enablePermissionsV2Query);

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
      .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
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
      .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
      .send(createRoleQuery);

    customRoleId = createRoleResponse.body.data.createOneRole.id;

    // Assign specific setting permissions to the custom role
    const upsertSettingPermissionsQuery = {
      query: `
        mutation UpsertSettingPermissions {
          upsertSettingPermissions(upsertSettingPermissionsInput: {
            roleId: "${customRoleId}"
            settingPermissionKeys: [${SettingPermissionType.DATA_MODEL}, ${SettingPermissionType.WORKSPACE}]
          }) {
            id
            setting
            roleId
          }
        }
      `,
    };

    await client
      .post('/graphql')
      .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
      .send(upsertSettingPermissionsQuery);

    // Assign the custom role to JONY (who uses MEMBER_ACCESS_TOKEN)
    const updateMemberRoleQuery = {
      query: `
        mutation UpdateWorkspaceMemberRole {
          updateWorkspaceMemberRole(
            workspaceMemberId: "${DEV_SEED_WORKSPACE_MEMBER_IDS.JONY}"
            roleId: "${customRoleId}"
          ) {
            id
            roles {
              id
              label
            }
          }
        }
      `,
    };

    await client
      .post('/graphql')
      .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
      .send(updateMemberRoleQuery);
  });

  afterAll(async () => {
    // Restore JONY's original Member role
    const restoreMemberRoleQuery = {
      query: `
        mutation UpdateWorkspaceMemberRole {
          updateWorkspaceMemberRole(
            workspaceMemberId: "${DEV_SEED_WORKSPACE_MEMBER_IDS.JONY}"
            roleId: "${originalMemberRoleId}"
          ) {
            id
          }
        }
      `,
    };

    await client
      .post('/graphql')
      .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
      .send(restoreMemberRoleQuery);

    // Delete the custom role
    const deleteRoleQuery = deleteOneRoleOperationFactory(customRoleId);

    await client
      .post('/graphql')
      .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
      .send(deleteRoleQuery);

    // Disable Permissions V2
    const disablePermissionsV2Query = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      'IS_PERMISSIONS_V2_ENABLED',
      false,
    );

    await makeGraphqlAPIRequest(disablePermissionsV2Query);
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
        .set('Authorization', `Bearer ${MEMBER_ACCESS_TOKEN}`)
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
        .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
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
        .set('Authorization', `Bearer ${MEMBER_ACCESS_TOKEN}`)
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
        .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
        .send(restoreWorkspaceQuery);
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
        .set('Authorization', `Bearer ${MEMBER_ACCESS_TOKEN}`)
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
        .set('Authorization', `Bearer ${MEMBER_ACCESS_TOKEN}`)
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
        .set('Authorization', `Bearer ${MEMBER_ACCESS_TOKEN}`)
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
              settingPermissions {
                setting
              }
            }
          }
        `,
      };

      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
        .send(getRoleQuery);

      const customRole = response.body.data.getRoles.find(
        (role: any) => role.id === customRoleId,
      );

      expect(customRole).toBeDefined();
      expect(customRole.canUpdateAllSettings).toBe(false);
      expect(customRole.settingPermissions).toHaveLength(2);
      expect(
        customRole.settingPermissions.map((p: any) => p.setting),
      ).toContain(SettingPermissionType.DATA_MODEL);
      expect(
        customRole.settingPermissions.map((p: any) => p.setting),
      ).toContain(SettingPermissionType.WORKSPACE);
    });
  });

  describe('Dynamic Permission Updates', () => {
    it('should allow adding new setting permissions to existing role', async () => {
      // Add SECURITY permission to the custom role
      const upsertSecurityPermissionQuery = {
        query: `
          mutation UpsertSettingPermissions {
            upsertSettingPermissions(upsertSettingPermissionsInput: {
              roleId: "${customRoleId}"
              settingPermissionKeys: [${SettingPermissionType.DATA_MODEL}, ${SettingPermissionType.WORKSPACE}, ${SettingPermissionType.SECURITY}]
            }) {
              id
              setting
              roleId
            }
          }
        `,
      };

      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
        .send(upsertSecurityPermissionQuery);

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.upsertSettingPermissions).toHaveLength(3);

      // Verify the user now has access to security operations
      // Note: This would require a specific security operation to test
      // For now, we just verify the permission was added
      const getRoleQuery = {
        query: `
          query GetRole {
            getRoles {
              id
              settingPermissions {
                setting
              }
            }
          }
        `,
      };

      const roleResponse = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
        .send(getRoleQuery);

      const updatedRole = roleResponse.body.data.getRoles.find(
        (role: any) => role.id === customRoleId,
      );

      expect(updatedRole.settingPermissions).toHaveLength(3);
      expect(
        updatedRole.settingPermissions.map((p: any) => p.setting),
      ).toContain(SettingPermissionType.SECURITY);
    });

    it('should allow removing setting permissions from existing role', async () => {
      // Remove SECURITY permission, keep only DATA_MODEL and WORKSPACE
      const upsertReducedPermissionsQuery = {
        query: `
          mutation UpsertSettingPermissions {
            upsertSettingPermissions(upsertSettingPermissionsInput: {
              roleId: "${customRoleId}"
              settingPermissionKeys: [${SettingPermissionType.DATA_MODEL}, ${SettingPermissionType.WORKSPACE}]
            }) {
              id
              setting
              roleId
            }
          }
        `,
      };

      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
        .send(upsertReducedPermissionsQuery);

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.upsertSettingPermissions).toHaveLength(2);

      // Verify SECURITY permission was removed
      const getRoleQuery = {
        query: `
          query GetRole {
            getRoles {
              id
              settingPermissions {
                setting
              }
            }
          }
        `,
      };

      const roleResponse = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
        .send(getRoleQuery);

      const updatedRole = roleResponse.body.data.getRoles.find(
        (role: any) => role.id === customRoleId,
      );

      expect(updatedRole.settingPermissions).toHaveLength(2);
      expect(
        updatedRole.settingPermissions.map((p: any) => p.setting),
      ).not.toContain(SettingPermissionType.SECURITY);
    });
  });
});
