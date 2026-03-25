import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { makeGraphqlAPIRequestWithGuestRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-guest-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { restoreOneOperationFactory } from 'test/integration/graphql/utils/restore-one-operation-factory.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

describe('restoreOneObjectRecordsPermissions', () => {
  const personId = randomUUID();

  beforeAll(async () => {
    // Create a person
    const createGraphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      data: {
        id: personId,
      },
    });

    await makeGraphqlAPIRequest(createGraphqlOperation);

    // Delete the person
    const deleteGraphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      recordId: personId,
    });

    await makeGraphqlAPIRequest(deleteGraphqlOperation);
  });

  it('should throw a permission error when user does not have permission (guest role)', async () => {
    const graphqlOperation = restoreOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      recordId: personId,
    });

    const response = await makeGraphqlAPIRequestWithGuestRole(graphqlOperation);

    expect(response.body.data).toStrictEqual({ restorePerson: null });
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should restore an object record when user has permission (admin role)', async () => {
    const graphqlOperation = restoreOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      recordId: personId,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.restorePerson).toBeDefined();
    expect(response.body.data.restorePerson.id).toBe(personId);
  });
});
