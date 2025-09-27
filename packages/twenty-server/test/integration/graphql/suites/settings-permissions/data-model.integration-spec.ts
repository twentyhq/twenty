import { createOneFieldMetadataQueryFactory } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-query-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadataQueryFactory } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata-query-factory.util';
import { updateOneFieldMetadataQueryFactory } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata-query-factory.util';
import { createOneObjectMetadataQueryFactory } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-query-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadataQueryFactory } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata-query-factory.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadataQueryFactory } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata-query-factory.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeMetadataAPIRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

describe('datamodel permissions', () => {
  describe('fieldMetadata', () => {
    let listingObjectId = '';
    let testFieldId = '';

    beforeAll(async () => {
      const { data } = await createOneObjectMetadata({
        input: {
          nameSingular: 'listing',
          namePlural: 'listings',
          labelSingular: 'Listing',
          labelPlural: 'Listings',
          icon: 'IconBuildingSkyscraper',
        },
      });

      listingObjectId = data.createOneObject.id;

      const { data: createdFieldData } = await createOneFieldMetadata({
        input: {
          name: 'house',
          type: FieldMetadataType.TEXT,
          label: 'House',
          objectMetadataId: listingObjectId,
        },
      });

      testFieldId = createdFieldData.createOneField.id;
    });
    afterAll(async () => {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: listingObjectId,
          updatePayload: {
            isActive: false,
          },
        },
      });
      await deleteOneObjectMetadata({
        input: { idToDelete: listingObjectId },
      });
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
        const graphqlOperation = createOneFieldMetadataQueryFactory({
          input: createFieldInput,
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

        const graphqlOperation = updateOneFieldMetadataQueryFactory({
          input: { idToUpdate: testFieldId, updatePayload: updateFieldInput },
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
        const graphqlOperation = deleteOneFieldMetadataQueryFactory({
          input: { idToDelete: testFieldId },
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
        const graphqlOperation = createOneObjectMetadataQueryFactory({
          gqlFields: `
            id
        `,
          input: {
            labelPlural: 'Test Objects',
            labelSingular: 'Test Object',
            namePlural: 'testObjects',
            nameSingular: 'testObject',
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
        const { data } = await createOneObjectMetadata({
          input: {
            labelPlural: 'Listings',
            labelSingular: 'Listing',
            namePlural: 'listings',
            nameSingular: 'listing',
            icon: 'IconBuildingSkyscraper',
          },
        });

        listingObjectId = data.createOneObject.id;
      });
      afterAll(async () => {
        await updateOneObjectMetadata({
          expectToFail: false,
          input: {
            idToUpdate: listingObjectId,
            updatePayload: {
              isActive: false,
            },
          },
        });
        await deleteOneObjectMetadata({
          input: { idToDelete: listingObjectId },
        });
      });
      describe('updateOne', () => {
        it('should throw a permission error when user does not have permission (member role)', async () => {
          // Arrange
          const graphqlOperation = updateOneObjectMetadataQueryFactory({
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
          const graphqlOperation = deleteOneObjectMetadataQueryFactory({
            input: { idToDelete: listingObjectId },
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
