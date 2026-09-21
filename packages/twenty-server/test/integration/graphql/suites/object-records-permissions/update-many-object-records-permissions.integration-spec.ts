import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { makeGraphqlAPIRequestWithGuestRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-guest-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

type RecordWithId = { id: string; [key: string]: unknown };

// updateMany returns its RETURNING rows in an unspecified order, so key them by
// id rather than asserting positionally.
const keyRecordsById = (
  records: RecordWithId[],
): Record<string, RecordWithId> =>
  Object.fromEntries(records.map((record) => [record.id, record]));

describe('updateManyObjectRecordsPermissions', () => {
  let createdPersonIds: string[] = [];

  afterEach(async () => {
    if (createdPersonIds.length > 0) {
      await deleteRecordsByIds('person', createdPersonIds);
      createdPersonIds = [];
    }
  });

  it('should throw a permission error when user does not have permission (guest role)', async () => {
    const personId1 = randomUUID();
    const personId2 = randomUUID();
    const createGraphqlOperation = createManyOperationFactory({
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

    await makeGraphqlAPIRequest(createGraphqlOperation);
    createdPersonIds.push(personId1, personId2);

    const updateGraphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        id: {
          in: [personId1, personId2],
        },
      },
      data: {
        jobTitle: 'Senior Developer',
      },
    });

    const response = await makeGraphqlAPIRequestWithGuestRole(
      updateGraphqlOperation,
    );

    expect(response.body.data).toStrictEqual({ updatePeople: null });
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should update multiple object records when user has permission (admin role)', async () => {
    const personId1 = randomUUID();
    const personId2 = randomUUID();
    const createGraphqlOperation = createManyOperationFactory({
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

    await makeGraphqlAPIRequest(createGraphqlOperation);
    createdPersonIds.push(personId1, personId2);

    const updateGraphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        id: {
          in: [personId1, personId2],
        },
      },
      data: {
        jobTitle: 'Tech Lead',
      },
    });

    const response = await makeGraphqlAPIRequest(updateGraphqlOperation);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.updatePeople).toBeDefined();
    expect(response.body.data.updatePeople).toHaveLength(2);
    const updatedPeopleById = keyRecordsById(response.body.data.updatePeople);

    expect(updatedPeopleById[personId1]?.jobTitle).toBe('Tech Lead');
    expect(updatedPeopleById[personId2]?.jobTitle).toBe('Tech Lead');
  });

  it('should update multiple object records when executed by api key', async () => {
    const personId1 = randomUUID();
    const personId2 = randomUUID();
    const createGraphqlOperation = createManyOperationFactory({
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

    await makeGraphqlAPIRequest(createGraphqlOperation);
    createdPersonIds.push(personId1, personId2);

    const updateGraphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        id: {
          in: [personId1, personId2],
        },
      },
      data: {
        jobTitle: 'Product Manager',
      },
    });

    const response = await makeGraphqlAPIRequestWithApiKey(
      updateGraphqlOperation,
    );

    expect(response.body.data).toBeDefined();
    expect(response.body.data.updatePeople).toBeDefined();
    expect(response.body.data.updatePeople).toHaveLength(2);
    const updatedPeopleById = keyRecordsById(response.body.data.updatePeople);

    expect(updatedPeopleById[personId1]?.jobTitle).toBe('Product Manager');
    expect(updatedPeopleById[personId2]?.jobTitle).toBe('Product Manager');
  });
});
