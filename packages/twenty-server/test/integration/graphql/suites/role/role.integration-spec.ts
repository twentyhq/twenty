import gql from 'graphql-tag';
import { default as request } from 'supertest';
import { createRoleOperation } from 'test/integration/graphql/utils/create-custom-role-operation-factory.util';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

const client = request(`http://localhost:${APP_PORT}`);

describe('Role Permissions Validation', () => {
  describe('validateRoleDoesNotHaveWritingPermissionsWithoutReadingPermissionsOrThrow', () => {
    describe('createRole - Valid Cases', () => {
      it('should allow creating role with read=true and any write permissions', async () => {
        const operation = createRoleOperation({
          label: 'ValidRole',
          description: 'Valid role with read and write permissions',
          canUpdateAllSettings: true,
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
          canSoftDeleteAllObjectRecords: true,
          canDestroyAllObjectRecords: true,
        });

        const response = await makeGraphqlAPIRequest(operation);

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.createOneRole).toBeDefined();
        expect(response.body.data.createOneRole.label).toBe('ValidRole');
      });

      it('should allow creating role with read=false and all write permissions=false', async () => {
        const operation = createRoleOperation({
          label: 'ValidNoWriteRole',
          description: 'Valid role with no write permissions',
          canUpdateAllSettings: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
        });

        const response = await makeGraphqlAPIRequest(operation);

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.createOneRole).toBeDefined();
        expect(response.body.data.createOneRole.label).toBe('ValidNoWriteRole');
      });
    });

    describe('createRole - Invalid Cases', () => {
      it('should throw error when creating role with read=false but canDestroyAllObjectRecords=true', async () => {
        const operation = createRoleOperation({
          label: 'InvalidDestroyRole',
          description: 'Invalid role with destroy permission but no read',
          canUpdateAllSettings: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: true,
        });

        const response = await makeGraphqlAPIRequest(operation);

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
        const operation = createRoleOperation({
          label: 'BaseRole',
          description: 'Base role for update tests',
          canUpdateAllSettings: false,
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
        });

        const response = await makeGraphqlAPIRequest(operation);

        baseRoleId = response.body.data.createOneRole.id;
      });

      afterEach(async () => {
        if (baseRoleId) {
          await deleteRole(client, baseRoleId);
        }
      });

      it('should allow updating role to have read=true and any write permissions', async () => {
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
        expect(response.body.data.updateOneRole).toBeDefined();
        expect(response.body.data.updateOneRole.canReadAllObjectRecords).toBe(
          true,
        );
        expect(response.body.data.updateOneRole.canUpdateAllObjectRecords).toBe(
          true,
        );
        expect(
          response.body.data.updateOneRole.canSoftDeleteAllObjectRecords,
        ).toBe(true);
        expect(
          response.body.data.updateOneRole.canDestroyAllObjectRecords,
        ).toBe(true);
      });

      it('should allow updating role to have read=false and all write permissions=false', async () => {
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
        expect(response.body.data.updateOneRole).toBeDefined();
        expect(response.body.data.updateOneRole.canReadAllObjectRecords).toBe(
          false,
        );
        expect(response.body.data.updateOneRole.canUpdateAllObjectRecords).toBe(
          false,
        );
        expect(
          response.body.data.updateOneRole.canSoftDeleteAllObjectRecords,
        ).toBe(false);
        expect(
          response.body.data.updateOneRole.canDestroyAllObjectRecords,
        ).toBe(false);
      });
    });

    describe('updateRole - Invalid Cases', () => {
      let roleWithWritePermissionsId: string;

      beforeEach(async () => {
        const operation = createRoleOperation({
          label: 'RoleWithWritePermissions',
          description: 'Role with write permissions for update tests',
          canUpdateAllSettings: false,
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
          canSoftDeleteAllObjectRecords: true,
          canDestroyAllObjectRecords: true,
        });

        const response = await makeGraphqlAPIRequest(operation);

        roleWithWritePermissionsId = response.body.data.createOneRole.id;
      });

      afterEach(async () => {
        if (roleWithWritePermissionsId) {
          await deleteRole(client, roleWithWritePermissionsId);
        }
      });

      it('should throw error when updating role to read=false but keeping write permissions', async () => {
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

      it('should allow updating role to read=false when explicitly setting all write permissions to false', async () => {
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
        expect(response.body.data.updateOneRole).toBeDefined();
        expect(response.body.data.updateOneRole.canReadAllObjectRecords).toBe(
          false,
        );
        expect(response.body.data.updateOneRole.canUpdateAllObjectRecords).toBe(
          false,
        );
        expect(
          response.body.data.updateOneRole.canSoftDeleteAllObjectRecords,
        ).toBe(false);
        expect(
          response.body.data.updateOneRole.canDestroyAllObjectRecords,
        ).toBe(false);
      });

      it('should allow updating role to read=false when explicitly setting some write permissions to false', async () => {
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
        expect(response.body.data.updateOneRole).toBeDefined();
        expect(
          response.body.data.updateOneRole.canSoftDeleteAllObjectRecords,
        ).toBe(false);
      });
    });
  });
});
