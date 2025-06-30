import gql from 'graphql-tag';
import { default as request } from 'supertest';
import { createRoleOperation } from 'test/integration/graphql/utils/create-custom-role-operation-factory.util';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createUpsertObjectPermissionsOperation } from 'test/integration/graphql/utils/upsert-object-permission-operation-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

const client = request(`http://localhost:${APP_PORT}`);

describe('Object Permissions Validation', () => {
  let customRoleId: string;
  let personObjectId: string;
  let companyObjectId: string;

  beforeAll(async () => {
    // Get object metadata IDs for Person and Company
    const getObjectMetadataOperation = {
      query: gql`
        query {
          objects(paging: { first: 1000 }) {
            edges {
              node {
                id
                nameSingular
              }
            }
          }
        }
      `,
    };

    const objectMetadataResponse = await makeMetadataAPIRequest(
      getObjectMetadataOperation,
    );
    const objects = objectMetadataResponse.body.data.objects.edges;

    personObjectId = objects.find(
      (obj: any) => obj.node.nameSingular === 'person',
    )?.node.id;
    companyObjectId = objects.find(
      (obj: any) => obj.node.nameSingular === 'company',
    )?.node.id;

    expect(personObjectId).toBeDefined();
    expect(companyObjectId).toBeDefined();
  });

  describe('cases with role with all rights by default', () => {
    beforeEach(async () => {
      // Create a custom role for each test
      const roleOperation = createRoleOperation({
        label: 'TestRole',
        description: 'Test role for object permission validation',
        canUpdateAllSettings: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: true,
        canDestroyAllObjectRecords: true,
      });

      const response = await makeGraphqlAPIRequest(roleOperation);

      customRoleId = response.body.data.createOneRole.id;
    });

    afterEach(async () => {
      // Clean up the role after each test
      if (customRoleId) {
        await deleteRole(client, customRoleId);
      }
    });

    describe('validateObjectPermissionsOrThrow - basic valid cases', () => {
      it('should allow read=true with any write permissions', async () => {
        const operation = createUpsertObjectPermissionsOperation(customRoleId, [
          {
            objectMetadataId: personObjectId,
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: true,
            canDestroyObjectRecords: true,
          },
        ]);

        const response = await makeGraphqlAPIRequest(operation);

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.upsertObjectPermissions).toHaveLength(1);
        expect(response.body.data.upsertObjectPermissions[0]).toMatchObject({
          objectMetadataId: personObjectId,
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: true,
        });
      });

      it('should allow read=false with all write permissions=false', async () => {
        const operation = createUpsertObjectPermissionsOperation(customRoleId, [
          {
            objectMetadataId: personObjectId,
            canReadObjectRecords: false,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
        ]);

        const response = await makeGraphqlAPIRequest(operation);

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.upsertObjectPermissions).toHaveLength(1);
        expect(response.body.data.upsertObjectPermissions[0]).toMatchObject({
          objectMetadataId: personObjectId,
          canReadObjectRecords: false,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
        });
      });
    });

    describe('validateObjectPermissionsOrThrow - Invalid Cases', () => {
      it('should throw error when read=false but canUpdateObjectRecords=true', async () => {
        const operation = createUpsertObjectPermissionsOperation(
          customRoleId,
          [
            {
              objectMetadataId: personObjectId,
              canReadObjectRecords: false,
              canUpdateObjectRecords: true,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
          ],
          [
            'objectMetadataId',
            'canReadObjectRecords',
            'canUpdateObjectRecords',
          ],
        );

        const response = await makeGraphqlAPIRequest(operation);

        expect(response.body.data).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(
          PermissionsExceptionMessage.CANNOT_GIVE_WRITING_PERMISSION_ON_NON_READABLE_OBJECT,
        );
        expect(response.body.errors[0].extensions.code).toBe(
          ErrorCode.BAD_USER_INPUT,
        );
      });

      it('should throw error when read=false but canSoftDeleteObjectRecords=true', async () => {
        const operation = createUpsertObjectPermissionsOperation(
          customRoleId,
          [
            {
              objectMetadataId: personObjectId,
              canReadObjectRecords: false,
              canUpdateObjectRecords: false,
              canSoftDeleteObjectRecords: true,
              canDestroyObjectRecords: false,
            },
          ],
          [
            'objectMetadataId',
            'canReadObjectRecords',
            'canSoftDeleteObjectRecords',
          ],
        );

        const response = await makeGraphqlAPIRequest(operation);

        expect(response.body.data).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(
          PermissionsExceptionMessage.CANNOT_GIVE_WRITING_PERMISSION_ON_NON_READABLE_OBJECT,
        );
        expect(response.body.errors[0].extensions.code).toBe(
          ErrorCode.BAD_USER_INPUT,
        );
      });

      it('should throw error when read=false but canDestroyObjectRecords=true', async () => {
        const operation = createUpsertObjectPermissionsOperation(
          customRoleId,
          [
            {
              objectMetadataId: personObjectId,
              canReadObjectRecords: false,
              canUpdateObjectRecords: false,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: true,
            },
          ],
          [
            'objectMetadataId',
            'canReadObjectRecords',
            'canDestroyObjectRecords',
          ],
        );

        const response = await makeGraphqlAPIRequest(operation);

        expect(response.body.data).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(
          PermissionsExceptionMessage.CANNOT_GIVE_WRITING_PERMISSION_ON_NON_READABLE_OBJECT,
        );
        expect(response.body.errors[0].extensions.code).toBe(
          ErrorCode.BAD_USER_INPUT,
        );
      });

      it('should throw error when read=false but multiple write permissions=true', async () => {
        const operation = createUpsertObjectPermissionsOperation(
          customRoleId,
          [
            {
              objectMetadataId: personObjectId,
              canReadObjectRecords: false,
              canUpdateObjectRecords: true,
              canSoftDeleteObjectRecords: true,
              canDestroyObjectRecords: false,
            },
          ],
          [
            'objectMetadataId',
            'canReadObjectRecords',
            'canUpdateObjectRecords',
            'canSoftDeleteObjectRecords',
          ],
        );

        const response = await makeGraphqlAPIRequest(operation);

        expect(response.body.data).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(
          PermissionsExceptionMessage.CANNOT_GIVE_WRITING_PERMISSION_ON_NON_READABLE_OBJECT,
        );
        expect(response.body.errors[0].extensions.code).toBe(
          ErrorCode.BAD_USER_INPUT,
        );
      });
    });

    describe('validateObjectPermissionsOrThrow - Multiple Objects', () => {
      it('should validate permissions across multiple objects correctly', async () => {
        const operation = createUpsertObjectPermissionsOperation(
          customRoleId,
          [
            {
              objectMetadataId: personObjectId,
              canReadObjectRecords: true,
              canUpdateObjectRecords: true,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
            {
              objectMetadataId: companyObjectId,
              canReadObjectRecords: false,
              canUpdateObjectRecords: false,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
          ],
          [
            'objectMetadataId',
            'canReadObjectRecords',
            'canUpdateObjectRecords',
          ],
        );

        const response = await makeGraphqlAPIRequest(operation);

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.upsertObjectPermissions).toHaveLength(2);
      });

      it('should throw error when one object has invalid permissions', async () => {
        const operation = createUpsertObjectPermissionsOperation(
          customRoleId,
          [
            {
              objectMetadataId: personObjectId,
              canReadObjectRecords: true,
              canUpdateObjectRecords: true,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
            {
              objectMetadataId: companyObjectId,
              canReadObjectRecords: false,
              canUpdateObjectRecords: true, // This should fail
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
          ],
          [
            'objectMetadataId',
            'canReadObjectRecords',
            'canUpdateObjectRecords',
          ],
        );

        const response = await makeGraphqlAPIRequest(operation);

        expect(response.body.data).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(
          PermissionsExceptionMessage.CANNOT_GIVE_WRITING_PERMISSION_ON_NON_READABLE_OBJECT,
        );
        expect(response.body.errors[0].extensions.code).toBe(
          ErrorCode.BAD_USER_INPUT,
        );
      });
    });
  });

  describe('cases with role with no rights by default', () => {
    let roleWithoutPermissions: string;

    beforeEach(async () => {
      // Create a role with write permissions as defaults
      const roleWithoutPermissionsQuery = createRoleOperation({
        label: 'TestRoleWithNoRights',
        description: 'Test role with no rights',
        canUpdateAllSettings: false,
        canReadAllObjectRecords: false,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      });

      const response = await makeGraphqlAPIRequest(roleWithoutPermissionsQuery);

      roleWithoutPermissions = response.body.data.createOneRole.id;
    });

    afterEach(async () => {
      if (roleWithoutPermissions) {
        await deleteRole(client, roleWithoutPermissions);
      }
    });

    it('should throw error when read=true and write permissions inherit false from role defaults', async () => {
      const operation = createUpsertObjectPermissionsOperation(
        roleWithoutPermissions,
        [
          {
            objectMetadataId: personObjectId,
            canUpdateObjectRecords: true,
          },
        ],
        ['objectMetadataId', 'canReadObjectRecords'],
      );

      const response = await makeGraphqlAPIRequest(operation);

      expect(response.body.data).toBeNull();
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.CANNOT_GIVE_WRITING_PERMISSION_ON_NON_READABLE_OBJECT,
      );
      expect(response.body.errors[0].extensions.code).toBe(
        ErrorCode.BAD_USER_INPUT,
      );
    });

    it('should work when read=true and update=true', async () => {
      const operation = createUpsertObjectPermissionsOperation(
        roleWithoutPermissions,
        [
          {
            objectMetadataId: personObjectId,
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
          },
        ],
      );

      const response = await makeGraphqlAPIRequest(operation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.upsertObjectPermissions).toHaveLength(1);
      expect(response.body.data.upsertObjectPermissions[0]).toMatchObject({
        objectMetadataId: personObjectId,
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: null,
        canDestroyObjectRecords: null,
      });
    });
  });
});
