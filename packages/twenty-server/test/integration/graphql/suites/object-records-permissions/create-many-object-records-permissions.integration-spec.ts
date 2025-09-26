import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { makeGraphqlAPIRequestWithGuestRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-guest-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

describe('createManyObjectRecordsPermissions', () => {
  let createdPersonIds: string[] = [];

  afterEach(async () => {
    if (createdPersonIds.length > 0) {
      await deleteRecordsByIds('person', createdPersonIds);
      createdPersonIds = [];
    }
  });

  it('should throw a permission error when user does not have permission (guest role)', async () => {
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      data: [
        {
          id: randomUUID(),
        },
        {
          id: randomUUID(),
        },
      ],
    });

    const response = await makeGraphqlAPIRequestWithGuestRole(graphqlOperation);

    expect(response.body.data).toStrictEqual({ createPeople: null });
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should create multiple object records when user has permission (admin role)', async () => {
    const personId1 = randomUUID();
    const personId2 = randomUUID();

    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      data: [
        {
          id: personId1,
        },
        {
          id: personId2,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    createdPersonIds.push(personId1, personId2);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.createPeople).toBeDefined();
    expect(response.body.data.createPeople).toHaveLength(2);
    expect([
      response.body.data.createPeople[0].id,
      response.body.data.createPeople[1].id,
    ]).toContain(personId1);
    expect([
      response.body.data.createPeople[0].id,
      response.body.data.createPeople[1].id,
    ]).toContain(personId2);
  });

  it('should create multiple object records when executed by api key', async () => {
    const personId1 = randomUUID();
    const personId2 = randomUUID();

    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      data: [
        {
          id: personId1,
        },
        {
          id: personId2,
        },
      ],
    });

    const response = await makeGraphqlAPIRequestWithApiKey(graphqlOperation);

    createdPersonIds.push(personId1, personId2);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.createPeople).toBeDefined();
    expect(response.body.data.createPeople).toHaveLength(2);
    expect(response.body.data.createPeople[0].id).toBe(personId1);
    expect(response.body.data.createPeople[1].id).toBe(personId2);
  });
});
