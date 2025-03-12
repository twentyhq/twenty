import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';
import { createCustomTextFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-custom-text-field-metadata.util';
import { createOneFieldMetadataFactory } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-factory.util';
import { deleteOneFieldMetadataItemFactory } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata-factory.util';
import { updateOneFieldMetadataFactory } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata-factory.util';
import { createOneObjectMetadataFactory } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-factory.util';
import { createListingCustomObject } from 'test/integration/metadata/suites/object-metadata/utils/create-test-object-metadata.util';
import { deleteOneObjectMetadataItemFactory } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata-factory.util';
import { deleteOneObjectMetadataItem } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadataItemFactory } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata-factory.util';
import { makeMetadataAPIRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';
import { FieldMetadataType } from 'twenty-shared';

import { SEED_APPLE_WORKSPACE_ID } from 'src/database/typeorm-seeds/core/workspaces';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

describe('datamodel permissions', () => {
  beforeAll(async () => {
    const enablePermissionsQuery = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      'IsPermissionsEnabled',
      true,
    );

    await makeGraphqlAPIRequest(enablePermissionsQuery);
  });
  afterAll(async () => {
    const disablePermissionsQuery = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      'IsPermissionsEnabled',
      false,
    );

    await makeGraphqlAPIRequest(disablePermissionsQuery);
  });
  describe('fieldMetadata', () => {
    let listingObjectId = '';
    let testFieldId = '';

    beforeAll(async () => {
      const { objectMetadataId: createdObjectId } =
        await createListingCustomObject();

      listingObjectId = createdObjectId;

      const { fieldMetadataId: createdFieldMetadaId } =
        await createCustomTextFieldMetadata(createdObjectId);

      testFieldId = createdFieldMetadaId;
    });
    afterAll(async () => {
      await deleteOneObjectMetadataItem(listingObjectId);
    });
    describe('createOne', () => {
      it('should throw a permission error when user does not have permission (member role)', async () => {
        // Arrange
        const FIELD_NAME = 'testFieldForCreateOne';
        const createFieldInput = {
          name: FIELD_NAME,
          label: 'Test Field For CreateOne',
          type: FieldMetadataType.TEXT,
          objectMetadataId: listingObjectId,
        };

        // Act
        const graphqlOperation = createOneFieldMetadataFactory({
          input: { field: createFieldInput },
          gqlFields: `
              id
              name
          `,
        });

        const response =
          await makeMetadataAPIRequestWithMemberRole(graphqlOperation);

        // Assert
        expect(response.body.data).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(response.body.errors[0].extensions.code).toBe(
          ErrorCode.FORBIDDEN,
        );
      });
    });

    describe('updateOne', () => {
      it('should throw a permission error when user does not have permission (member role)', async () => {
        // Arrange
        const updateFieldInput = {
          name: 'updatedName',
          label: 'Updated Name',
        };

        const graphqlOperation = updateOneFieldMetadataFactory({
          input: { id: testFieldId, update: updateFieldInput },
          gqlFields: `
            id
            name
        `,
        });

        const response =
          await makeMetadataAPIRequestWithMemberRole(graphqlOperation);

        // Assert
        expect(response.body.data).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(response.body.errors[0].extensions.code).toBe(
          ErrorCode.FORBIDDEN,
        );
      });
    });

    describe('deleteOne', () => {
      it('should throw a permission error when user does not have permission (member role)', async () => {
        // Arrange
        const graphqlOperation = deleteOneFieldMetadataItemFactory({
          idToDelete: testFieldId,
        });

        const response =
          await makeMetadataAPIRequestWithMemberRole(graphqlOperation);

        // Assert
        expect(response.body.data).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(response.body.errors[0].extensions.code).toBe(
          ErrorCode.FORBIDDEN,
        );
      });
    });
  });

  describe('objectMetadata', () => {
    describe('createOne', () => {
      it('should throw a permission error when user does not have permission (member role)', async () => {
        // Arrange
        const graphqlOperation = createOneObjectMetadataFactory({
          gqlFields: `
            id
        `,
          input: {
            object: {
              labelPlural: 'Test Objects',
              labelSingular: 'Test Object',
              namePlural: 'testObjects',
              nameSingular: 'testObject',
            },
          },
        });

        const response =
          await makeMetadataAPIRequestWithMemberRole(graphqlOperation);

        // Assert
        expect(response.body.data).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(response.body.errors[0].extensions.code).toBe(
          ErrorCode.FORBIDDEN,
        );
      });
    });

    describe('update and delete a custom object', () => {
      let listingObjectId = '';

      beforeAll(async () => {
        const { objectMetadataId: createdObjectId } =
          await createListingCustomObject();

        listingObjectId = createdObjectId;
      });
      afterAll(async () => {
        await deleteOneObjectMetadataItem(listingObjectId);
      });
      describe('updateOne', () => {
        it('should throw a permission error when user does not have permission (member role)', async () => {
          // Arrange
          const graphqlOperation = updateOneObjectMetadataItemFactory({
            gqlFields: `
          id
        `,
            input: {
              idToUpdate: listingObjectId,
              updatePayload: {
                labelPlural: 'Updated Test Objects',
                labelSingular: 'Updated Test Object',
              },
            },
          });

          const response =
            await makeMetadataAPIRequestWithMemberRole(graphqlOperation);

          // Assert
          expect(response.body.data).toBeNull();
          expect(response.body.errors).toBeDefined();
          expect(response.body.errors[0].message).toBe(
            PermissionsExceptionMessage.PERMISSION_DENIED,
          );
          expect(response.body.errors[0].extensions.code).toBe(
            ErrorCode.FORBIDDEN,
          );
        });
      });
      describe('deleteOne', () => {
        it('should throw a permission error when user does not have permission (member role)', async () => {
          // Arrange
          const graphqlOperation = deleteOneObjectMetadataItemFactory({
            idToDelete: listingObjectId,
          });

          const response =
            await makeMetadataAPIRequestWithMemberRole(graphqlOperation);

          // Assert
          expect(response.body.data).toBeNull();
          expect(response.body.errors).toBeDefined();
          expect(response.body.errors[0].message).toBe(
            PermissionsExceptionMessage.PERMISSION_DENIED,
          );
          expect(response.body.errors[0].extensions.code).toBe(
            ErrorCode.FORBIDDEN,
          );
        });
      });
    });
  });
});
