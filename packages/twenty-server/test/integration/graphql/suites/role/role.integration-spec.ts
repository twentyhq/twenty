import gql from 'graphql-tag';
import { default as request } from 'supertest';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

const client = request(`http://localhost:${APP_PORT}`);

describe('Role Permissions Validation', () => {
  describe('validateRoleDoesNotHaveWritingPermissionsWithoutReadingPermissionsOrThrow', () => {
    describe('createRole - Valid Cases', () => {
      let createdRoleIds: string[] = [];

      afterEach(async () => {
        // Clean up created roles
        for (const roleId of createdRoleIds) {
          await deleteRole(client, roleId);
        }
        createdRoleIds = [];
      });

      it('should allow creating role with read=true and any write permissions', async () => {
        const createRoleOperation = {
          query: gql`
            mutation CreateOneRole {
              createOneRole(
                createRoleInput: {
                  label: "TestReadWriteRole"
                  description: "Test role with read and write permissions"
                  canUpdateAllSettings: false
                  canReadAllObjectRecords: true
                  canUpdateAllObjectRecords: true
                  canSoftDeleteAllObjectRecords: true
                  canDestroyAllObjectRecords: true
                }
              ) {
                id
                label
                canReadAllObjectRecords
                canUpdateAllObjectRecords
                canSoftDeleteAllObjectRecords
                canDestroyAllObjectRecords
              }
            }
          `,
        };

        const response = await makeGraphqlAPIRequest(createRoleOperation);

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.createOneRole).toMatchObject({
          label: 'TestReadWriteRole',
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
          canSoftDeleteAllObjectRecords: true,
          canDestroyAllObjectRecords: true,
        });

        createdRoleIds.push(response.body.data.createOneRole.id);
      });

      it('should allow creating role with read=false and all write permissions=false', async () => {
        const createRoleOperation = {
          query: gql`
            mutation CreateOneRole {
              createOneRole(
                createRoleInput: {
                  label: "TestReadOnlyRole"
                  description: "Test role with no permissions"
                  canUpdateAllSettings: false
                  canReadAllObjectRecords: false
                  canUpdateAllObjectRecords: false
                  canSoftDeleteAllObjectRecords: false
                  canDestroyAllObjectRecords: false
                }
              ) {
                id
                label
                canReadAllObjectRecords
                canUpdateAllObjectRecords
                canSoftDeleteAllObjectRecords
                canDestroyAllObjectRecords
              }
            }
          `,
        };

        const response = await makeGraphqlAPIRequest(createRoleOperation);

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.createOneRole).toMatchObject({
          label: 'TestReadOnlyRole',
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
        });

        createdRoleIds.push(response.body.data.createOneRole.id);
      });

      it('should allow creating role with read=true and mixed write permissions', async () => {
        const createRoleOperation = {
          query: gql`
            mutation CreateOneRole {
              createOneRole(
                createRoleInput: {
                  label: "TestMixedRole"
                  description: "Test role with mixed permissions"
                  canUpdateAllSettings: false
                  canReadAllObjectRecords: true
                  canUpdateAllObjectRecords: true
                  canSoftDeleteAllObjectRecords: false
                  canDestroyAllObjectRecords: false
                }
              ) {
                id
                label
                canReadAllObjectRecords
                canUpdateAllObjectRecords
                canSoftDeleteAllObjectRecords
                canDestroyAllObjectRecords
              }
            }
          `,
        };

        const response = await makeGraphqlAPIRequest(createRoleOperation);

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.createOneRole).toMatchObject({
          label: 'TestMixedRole',
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
        });

        createdRoleIds.push(response.body.data.createOneRole.id);
      });
    });

    describe('createRole - Invalid Cases', () => {
      it('should throw error when creating role with read=false but canDestroyAllObjectRecords=true', async () => {
        const createRoleOperation = {
          query: gql`
            mutation CreateOneRole {
              createOneRole(
                createRoleInput: {
                  label: "InvalidDestroyRole"
                  description: "Invalid role with destroy permission but no read"
                  canUpdateAllSettings: false
                  canReadAllObjectRecords: false
                  canUpdateAllObjectRecords: false
                  canSoftDeleteAllObjectRecords: false
                  canDestroyAllObjectRecords: true
                }
              ) {
                id
                label
              }
            }
          `,
        };

        const response = await makeGraphqlAPIRequest(createRoleOperation);

        expect(response.body.data).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(
          PermissionsExceptionMessage.CANNOT_GIVE_WRITING_PERMISSION_WITHOUT_READING_PERMISSION,
        );
        expect(response.body.errors[0].extensions.code).toBe(
          ErrorCode.BAD_USER_INPUT,
        );
      });

      it('should throw error when creating role with read=false but multiple write permissions=true', async () => {
        const createRoleOperation = {
          query: gql`
            mutation CreateOneRole {
              createOneRole(
                createRoleInput: {
                  label: "InvalidMultiWriteRole"
                  description: "Invalid role with multiple write permissions but no read"
                  canUpdateAllSettings: false
                  canReadAllObjectRecords: false
                  canUpdateAllObjectRecords: true
                  canSoftDeleteAllObjectRecords: true
                  canDestroyAllObjectRecords: false
                }
              ) {
                id
                label
              }
            }
          `,
        };

        const response = await makeGraphqlAPIRequest(createRoleOperation);

        expect(response.body.data).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(
          PermissionsExceptionMessage.CANNOT_GIVE_WRITING_PERMISSION_WITHOUT_READING_PERMISSION,
        );
        expect(response.body.errors[0].extensions.code).toBe(
          ErrorCode.BAD_USER_INPUT,
        );
      });
    });

    describe('updateRole - Valid Cases', () => {
      let baseRoleId: string;

      beforeEach(async () => {
        // Create a base role for updating
        const createRoleOperation = {
          query: gql`
            mutation CreateOneRole {
              createOneRole(
                createRoleInput: {
                  label: "BaseTestRole"
                  description: "Base role for update tests"
                  canUpdateAllSettings: false
                  canReadAllObjectRecords: true
                  canUpdateAllObjectRecords: false
                  canSoftDeleteAllObjectRecords: false
                  canDestroyAllObjectRecords: false
                }
              ) {
                id
                label
              }
            }
          `,
        };

        const response = await makeGraphqlAPIRequest(createRoleOperation);

        baseRoleId = response.body.data.createOneRole.id;
      });

      afterEach(async () => {
        if (baseRoleId) {
          await deleteRole(client, baseRoleId);
        }
      });

      it('should allow updating role to add write permissions when read=true', async () => {
        const updateRoleOperation = {
          query: gql`
            mutation UpdateOneRole($updateRoleInput: UpdateRoleInput!) {
              updateOneRole(updateRoleInput: $updateRoleInput) {
                id
                canReadAllObjectRecords
                canUpdateAllObjectRecords
                canSoftDeleteAllObjectRecords
                canDestroyAllObjectRecords
              }
            }
          `,
          variables: {
            updateRoleInput: {
              id: baseRoleId,
              update: {
                canUpdateAllObjectRecords: true,
                canSoftDeleteAllObjectRecords: true,
                canDestroyAllObjectRecords: true,
              },
            },
          },
        };

        const response = await makeGraphqlAPIRequest(updateRoleOperation);

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.updateOneRole).toMatchObject({
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
          canSoftDeleteAllObjectRecords: true,
          canDestroyAllObjectRecords: true,
        });
      });

      it('should allow updating role to remove read permission when all write permissions are false', async () => {
        const updateRoleOperation = {
          query: gql`
            mutation UpdateOneRole($updateRoleInput: UpdateRoleInput!) {
              updateOneRole(updateRoleInput: $updateRoleInput) {
                id
                canReadAllObjectRecords
                canUpdateAllObjectRecords
                canSoftDeleteAllObjectRecords
                canDestroyAllObjectRecords
              }
            }
          `,
          variables: {
            updateRoleInput: {
              id: baseRoleId,
              update: {
                canReadAllObjectRecords: false,
              },
            },
          },
        };

        const response = await makeGraphqlAPIRequest(updateRoleOperation);

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.updateOneRole).toMatchObject({
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
        });
      });

      it('should allow updating role to remove read permission and explicitly set write permissions to false', async () => {
        const updateRoleOperation = {
          query: gql`
            mutation UpdateOneRole($updateRoleInput: UpdateRoleInput!) {
              updateOneRole(updateRoleInput: $updateRoleInput) {
                id
                canReadAllObjectRecords
                canUpdateAllObjectRecords
                canSoftDeleteAllObjectRecords
                canDestroyAllObjectRecords
              }
            }
          `,
          variables: {
            updateRoleInput: {
              id: baseRoleId,
              update: {
                canReadAllObjectRecords: false,
                canUpdateAllObjectRecords: false,
                canSoftDeleteAllObjectRecords: false,
                canDestroyAllObjectRecords: false,
              },
            },
          },
        };

        const response = await makeGraphqlAPIRequest(updateRoleOperation);

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.updateOneRole).toMatchObject({
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
        });
      });
    });

    describe('updateRole - Invalid Cases', () => {
      let baseRoleId: string;

      beforeEach(async () => {
        // Create a base role for updating
        const createRoleOperation = {
          query: gql`
            mutation CreateOneRole {
              createOneRole(
                createRoleInput: {
                  label: "BaseTestRoleForInvalid"
                  description: "Base role for invalid update tests"
                  canUpdateAllSettings: false
                  canReadAllObjectRecords: true
                  canUpdateAllObjectRecords: false
                  canSoftDeleteAllObjectRecords: false
                  canDestroyAllObjectRecords: false
                }
              ) {
                id
                label
              }
            }
          `,
        };

        const response = await makeGraphqlAPIRequest(createRoleOperation);

        baseRoleId = response.body.data.createOneRole.id;
      });

      afterEach(async () => {
        if (baseRoleId) {
          await deleteRole(client, baseRoleId);
        }
      });

      it('should throw error when updating role to read=false while keeping existing write permission', async () => {
        // First, give the role write permissions
        await makeGraphqlAPIRequest({
          query: gql`
            mutation UpdateOneRole($updateRoleInput: UpdateRoleInput!) {
              updateOneRole(updateRoleInput: $updateRoleInput) {
                id
              }
            }
          `,
          variables: {
            updateRoleInput: {
              id: baseRoleId,
              update: {
                canUpdateAllObjectRecords: true,
              },
            },
          },
        });

        // Then try to remove read permission while keeping write permission
        const updateRoleOperation = {
          query: gql`
            mutation UpdateOneRole($updateRoleInput: UpdateRoleInput!) {
              updateOneRole(updateRoleInput: $updateRoleInput) {
                id
              }
            }
          `,
          variables: {
            updateRoleInput: {
              id: baseRoleId,
              update: {
                canReadAllObjectRecords: false,
              },
            },
          },
        };

        const response = await makeGraphqlAPIRequest(updateRoleOperation);

        expect(response.body.data).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(
          PermissionsExceptionMessage.CANNOT_GIVE_WRITING_PERMISSION_WITHOUT_READING_PERMISSION,
        );
        expect(response.body.errors[0].extensions.code).toBe(
          ErrorCode.BAD_USER_INPUT,
        );
      });

      it('should throw error when updating role to read=false but canUpdateAllObjectRecords=true', async () => {
        const updateRoleOperation = {
          query: gql`
            mutation UpdateOneRole($updateRoleInput: UpdateRoleInput!) {
              updateOneRole(updateRoleInput: $updateRoleInput) {
                id
              }
            }
          `,
          variables: {
            updateRoleInput: {
              id: baseRoleId,
              update: {
                canReadAllObjectRecords: false,
                canUpdateAllObjectRecords: true,
              },
            },
          },
        };

        const response = await makeGraphqlAPIRequest(updateRoleOperation);

        expect(response.body.data).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(
          PermissionsExceptionMessage.CANNOT_GIVE_WRITING_PERMISSION_WITHOUT_READING_PERMISSION,
        );
        expect(response.body.errors[0].extensions.code).toBe(
          ErrorCode.BAD_USER_INPUT,
        );
      });
    });

    describe('updateRole - Edge Cases with Existing Permissions', () => {
      let roleWithWritePermissionsId: string;

      beforeEach(async () => {
        // Create a role that already has write permissions
        const createRoleOperation = {
          query: gql`
            mutation CreateOneRole {
              createOneRole(
                createRoleInput: {
                  label: "RoleWithWritePermissions"
                  description: "Role with existing write permissions"
                  canUpdateAllSettings: false
                  canReadAllObjectRecords: true
                  canUpdateAllObjectRecords: true
                  canSoftDeleteAllObjectRecords: true
                  canDestroyAllObjectRecords: true
                }
              ) {
                id
                label
              }
            }
          `,
        };

        const response = await makeGraphqlAPIRequest(createRoleOperation);

        roleWithWritePermissionsId = response.body.data.createOneRole.id;
      });

      afterEach(async () => {
        if (roleWithWritePermissionsId) {
          await deleteRole(client, roleWithWritePermissionsId);
        }
      });

      it('should throw error when trying to remove read permission while existing write permissions remain', async () => {
        const updateRoleOperation = {
          query: gql`
            mutation UpdateOneRole($updateRoleInput: UpdateRoleInput!) {
              updateOneRole(updateRoleInput: $updateRoleInput) {
                id
              }
            }
          `,
          variables: {
            updateRoleInput: {
              id: roleWithWritePermissionsId,
              update: {
                canReadAllObjectRecords: false,
                // Not explicitly setting write permissions, so they keep existing values (true)
              },
            },
          },
        };

        const response = await makeGraphqlAPIRequest(updateRoleOperation);

        expect(response.body.data).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(
          PermissionsExceptionMessage.CANNOT_GIVE_WRITING_PERMISSION_WITHOUT_READING_PERMISSION,
        );
        expect(response.body.errors[0].extensions.code).toBe(
          ErrorCode.BAD_USER_INPUT,
        );
      });

      it('should work when removing read permission and explicitly setting all write permissions to false', async () => {
        const updateRoleOperation = {
          query: gql`
            mutation UpdateOneRole($updateRoleInput: UpdateRoleInput!) {
              updateOneRole(updateRoleInput: $updateRoleInput) {
                id
                canReadAllObjectRecords
                canUpdateAllObjectRecords
                canSoftDeleteAllObjectRecords
                canDestroyAllObjectRecords
              }
            }
          `,
          variables: {
            updateRoleInput: {
              id: roleWithWritePermissionsId,
              update: {
                canReadAllObjectRecords: false,
                canUpdateAllObjectRecords: false,
                canSoftDeleteAllObjectRecords: false,
                canDestroyAllObjectRecords: false,
              },
            },
          },
        };

        const response = await makeGraphqlAPIRequest(updateRoleOperation);

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.updateOneRole).toMatchObject({
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
        });
      });

      it('should work when updating only some write permissions while read=true', async () => {
        const updateRoleOperation = {
          query: gql`
            mutation UpdateOneRole($updateRoleInput: UpdateRoleInput!) {
              updateOneRole(updateRoleInput: $updateRoleInput) {
                id
                canReadAllObjectRecords
                canUpdateAllObjectRecords
                canSoftDeleteAllObjectRecords
                canDestroyAllObjectRecords
              }
            }
          `,
          variables: {
            updateRoleInput: {
              id: roleWithWritePermissionsId,
              update: {
                canSoftDeleteAllObjectRecords: false,
                // Keep other permissions as they are
              },
            },
          },
        };

        const response = await makeGraphqlAPIRequest(updateRoleOperation);

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.updateOneRole).toMatchObject({
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: true,
        });
      });
    });
  });
});
