import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadataQueryFactory } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata-query-factory.util';
import { updateOneObjectMetadataQueryFactory } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata-query-factory.util';
import { makeMetadataAPIRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';
import { getListingCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/get-listing-create-object-input';
import { getHouseCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/get-house-create-object-input';
import { createOneObjectMetadataQueryFactory } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-query-factory.util';

import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

describe('objectMetadata data model permissions', () => {
  let listingObjectId = '';

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      input: getListingCreateObjectInput(),
    });

    listingObjectId = data.createOneObject.id;
  });

  it('createOne object should throw a permission error when user does not have permission (member role)', async () => {
    // Arrange
    const graphqlOperation = createOneObjectMetadataQueryFactory({
      gqlFields: `
            id
        `,
      input: getHouseCreateObjectInput(),
    });

    const response =
      await makeMetadataAPIRequestWithMemberRole(graphqlOperation);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('updateOne object should throw a permission error when user does not have permission (member role)', async () => {
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
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('deleteOne object should throw a permission error when user does not have permission (member role)', async () => {
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
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });
});
