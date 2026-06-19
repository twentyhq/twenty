import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { restoreManyOperationFactory } from 'test/integration/graphql/utils/restore-many-operation-factory.util';

describe('restoreMany empty filter guard', () => {
  const seedSoftDeletedPeople = async () => {
    const personId1 = randomUUID();
    const personId2 = randomUUID();

    const createGraphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      data: [{ id: personId1 }, { id: personId2 }],
    });

    await makeGraphqlAPIRequest(createGraphqlOperation);

    const deleteGraphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: { id: { in: [personId1, personId2] } },
    });

    await makeGraphqlAPIRequest(deleteGraphqlOperation);

    return { personId1, personId2 };
  };

  const findLivingPeopleByIds = async (ids: string[]) => {
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

  it('should reject restoreMany with an empty filter and not restore any record', async () => {
    const { personId1, personId2 } = await seedSoftDeletedPeople();

    const restoreGraphqlOperation = restoreManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {},
    });

    const response = await makeGraphqlAPIRequest(restoreGraphqlOperation);

    expect(response.body.data).toStrictEqual({ restorePeople: null });
    expectOneNotInternalServerErrorSnapshot({ errors: response.body.errors });

    const livingIds = await findLivingPeopleByIds([personId1, personId2]);

    expect(livingIds).toHaveLength(0);

    await cleanupPeople([personId1, personId2]);
  });

  it('should still restore records when a valid filter is provided', async () => {
    const { personId1, personId2 } = await seedSoftDeletedPeople();

    const restoreGraphqlOperation = restoreManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: { id: { in: [personId1, personId2] } },
    });

    const response = await makeGraphqlAPIRequest(restoreGraphqlOperation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.restorePeople).toHaveLength(2);

    const livingIds = await findLivingPeopleByIds([personId1, personId2]);

    expect(livingIds).toEqual(expect.arrayContaining([personId1, personId2]));

    await cleanupPeople([personId1, personId2]);
  });
});
