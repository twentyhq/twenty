import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';

describe('updateMany empty filter guard', () => {
  const seedPeople = async () => {
    const personId1 = randomUUID();
    const personId2 = randomUUID();

    const createGraphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      data: [
        { id: personId1, jobTitle: 'Original' },
        { id: personId2, jobTitle: 'Original' },
      ],
    });

    await makeGraphqlAPIRequest(createGraphqlOperation);

    return { personId1, personId2 };
  };

  const findPeopleJobTitlesByIds = async (ids: string[]) => {
    const findGraphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: { id: { in: ids } },
    });

    const response = await makeGraphqlAPIRequest(findGraphqlOperation);

    return response.body.data.people.edges.map(
      (edge: { node: { jobTitle: string } }) => edge.node.jobTitle,
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

  it('should reject updateMany with an empty filter and not update any record', async () => {
    const { personId1, personId2 } = await seedPeople();

    const updateGraphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      data: { jobTitle: 'HACKED' },
      filter: {},
    });

    const response = await makeGraphqlAPIRequest(updateGraphqlOperation);

    expect(response.body.data).toStrictEqual({ updatePeople: null });
    expectOneNotInternalServerErrorSnapshot({ errors: response.body.errors });

    const jobTitles = await findPeopleJobTitlesByIds([personId1, personId2]);

    expect(jobTitles).toEqual(['Original', 'Original']);

    await cleanupPeople([personId1, personId2]);
  });

  it('should still update records when a valid filter is provided', async () => {
    const { personId1, personId2 } = await seedPeople();

    const updateGraphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      data: { jobTitle: 'Updated' },
      filter: { id: { in: [personId1, personId2] } },
    });

    const response = await makeGraphqlAPIRequest(updateGraphqlOperation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updatePeople).toHaveLength(2);

    const jobTitles = await findPeopleJobTitlesByIds([personId1, personId2]);

    expect(jobTitles).toEqual(['Updated', 'Updated']);

    await cleanupPeople([personId1, personId2]);
  });
});
