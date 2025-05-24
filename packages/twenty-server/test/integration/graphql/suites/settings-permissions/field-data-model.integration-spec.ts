import { createOneFieldMetadataQueryFactory } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-query-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadataQueryFactory } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata-query-factory.util';
import { updateOneFieldMetadataQueryFactory } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata-query-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { makeMetadataAPIRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { getListingCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/get-listing-create-object-input';

import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

describe('fieldMetadata data model permissions', () => {
  let listingObjectId = '';
  let testFieldId = '';

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      input: getListingCreateObjectInput(),
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

  it('createOne field should throw a permission error when user does not have permission (member role)', async () => {
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
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('updateOne field should throw a permission error when user does not have permission (member role)', async () => {
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
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('deleteOne field should throw a permission error when user does not have permission (member role)', async () => {
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
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });
});
