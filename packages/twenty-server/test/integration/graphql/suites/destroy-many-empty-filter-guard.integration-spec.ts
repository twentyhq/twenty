import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

describe('destroyMany / deleteMany empty filter guard', () => {
  const seedPeople = async () => {
    const personId1 = randomUUID();
    const personId2 = randomUUID();

    const createGraphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      data: [{ id: personId1 }, { id: personId2 }],
    });

    await makeGraphqlAPIRequest(createGraphqlOperation);

    return { personId1, personId2 };
  };

  const findPeopleByIds = async (ids: string[]) => {
    const findGraphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: { id: { in: ids } },
    });

    const response = await makeGraphqlAPIRequest(findGraphqlOperation);

    return response.body.data.people.edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );
  };

  const cleanupPeople = async (ids: string[]) => {
    const destroyGraphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: { id: { in: ids } },
    });

    await makeGraphqlAPIRequest(destroyGraphqlOperation);
  };

  it('should reject destroyMany with an empty filter and not delete any record', async () => {
    const { personId1, personId2 } = await seedPeople();

    const destroyGraphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {},
    });

    const response = await makeGraphqlAPIRequest(destroyGraphqlOperation);

    expect(response.body.data).toStrictEqual({ destroyPeople: null });
    expectOneNotInternalServerErrorSnapshot({ errors: response.body.errors });

    const remainingIds = await findPeopleByIds([personId1, personId2]);

    expect(remainingIds).toEqual(
      expect.arrayContaining([personId1, personId2]),
    );

    await cleanupPeople([personId1, personId2]);
  });

  it('should reject deleteMany with an empty filter and not soft-delete any record', async () => {
    const { personId1, personId2 } = await seedPeople();

    const deleteGraphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {},
    });

    const response = await makeGraphqlAPIRequest(deleteGraphqlOperation);

    expect(response.body.data).toStrictEqual({ deletePeople: null });
    expectOneNotInternalServerErrorSnapshot({ errors: response.body.errors });

    const remainingIds = await findPeopleByIds([personId1, personId2]);

    expect(remainingIds).toEqual(
      expect.arrayContaining([personId1, personId2]),
    );

    await cleanupPeople([personId1, personId2]);
  });

  it('should still destroy records when a valid filter is provided', async () => {
    const { personId1, personId2 } = await seedPeople();

    const destroyGraphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: { id: { in: [personId1, personId2] } },
    });

    const response = await makeGraphqlAPIRequest(destroyGraphqlOperation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.destroyPeople).toHaveLength(2);

    const remainingIds = await findPeopleByIds([personId1, personId2]);

    expect(remainingIds).toHaveLength(0);
  });
});
