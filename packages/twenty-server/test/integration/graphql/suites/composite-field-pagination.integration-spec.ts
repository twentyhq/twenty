import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import {
  TEST_PERSON_1_ID,
  TEST_PERSON_2_ID,
  TEST_PERSON_3_ID,
  TEST_PERSON_4_ID,
  TEST_PERSON_5_ID,
} from 'test/integration/constants/test-person-ids.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

describe('GraphQL People Pagination with Composite Field Sorting', () => {
  beforeAll(async () => {
    await deleteAllRecords('person');

    const testPeople = [
      {
        id: TEST_PERSON_1_ID,
        firstName: 'Alice',
        lastName: 'Brown',
      },
      {
        id: TEST_PERSON_2_ID,
        firstName: 'Alice',
        lastName: 'Smith',
      },
      {
        id: TEST_PERSON_3_ID,
        firstName: 'Bob',
        lastName: 'Johnson',
      },
      {
        id: TEST_PERSON_4_ID,
        firstName: 'Bob',
        lastName: 'Williams',
      },
      {
        id: TEST_PERSON_5_ID,
        firstName: 'Charlie',
        lastName: 'Davis',
      },
    ];

    for (const person of testPeople) {
      const graphqlOperation = createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        data: {
          id: person.id,
          name: {
            firstName: person.firstName,
            lastName: person.lastName,
          },
        },
      });

      await makeGraphqlAPIRequest(graphqlOperation).expect(200);
    }
  });

  it('should support pagination with fullName composite field in ascending order', async () => {
    const firstPageOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      orderBy: {
        name: {
          firstName: 'AscNullsLast',
          lastName: 'AscNullsLast',
        },
      },
      first: 2,
    });

    const firstPageResponse =
      await makeGraphqlAPIRequest(firstPageOperation).expect(200);

    const firstPagePeople = firstPageResponse.body.data.people.edges.map(
      (edge: any) => edge.node,
    );
    const firstPageCursor =
      firstPageResponse.body.data.people.pageInfo.endCursor;

    expect(firstPagePeople).toHaveLength(2);
    expect(firstPageResponse.body.data.people.pageInfo.hasNextPage).toBe(true);

    expect(firstPagePeople[0].name.firstName).toBe('Alice');
    expect(firstPagePeople[0].name.lastName).toBe('Brown');
    expect(firstPagePeople[1].name.firstName).toBe('Alice');
    expect(firstPagePeople[1].name.lastName).toBe('Smith');

    const secondPageOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      orderBy: {
        name: {
          firstName: 'AscNullsLast',
          lastName: 'AscNullsLast',
        },
      },
      first: 2,
      after: firstPageCursor,
    });

    const secondPageResponse =
      await makeGraphqlAPIRequest(secondPageOperation).expect(200);

    const secondPagePeople = secondPageResponse.body.data.people.edges.map(
      (edge: any) => edge.node,
    );

    expect(secondPagePeople).toHaveLength(2);

    expect(secondPagePeople[0].name.firstName).toBe('Bob');
    expect(secondPagePeople[0].name.lastName).toBe('Johnson');
    expect(secondPagePeople[1].name.firstName).toBe('Bob');
    expect(secondPagePeople[1].name.lastName).toBe('Williams');

    const firstPageIds = firstPagePeople.map((p: { id: string }) => p.id);
    const secondPageIds = secondPagePeople.map((p: { id: string }) => p.id);
    const intersection = firstPageIds.filter((id: string) =>
      secondPageIds.includes(id),
    );

    expect(intersection).toHaveLength(0);

    const thirdPageOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      orderBy: {
        name: {
          firstName: 'AscNullsLast',
          lastName: 'AscNullsLast',
        },
      },
      first: 2,
      after: secondPageResponse.body.data.people.pageInfo.endCursor,
    });

    const thirdPageResponse =
      await makeGraphqlAPIRequest(thirdPageOperation).expect(200);

    const thirdPagePeople = thirdPageResponse.body.data.people.edges.map(
      (edge: any) => edge.node,
    );

    expect(thirdPagePeople).toHaveLength(1);
    expect(thirdPagePeople[0].name.firstName).toBe('Charlie');
    expect(thirdPagePeople[0].name.lastName).toBe('Davis');
    expect(thirdPageResponse.body.data.people.pageInfo.hasNextPage).toBe(false);
  });

  it('should support cursor-based pagination with fullName in descending order', async () => {
    const firstPageOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      orderBy: {
        name: {
          firstName: 'DescNullsLast',
          lastName: 'DescNullsLast',
        },
      },
      first: 2,
    });

    const firstPageResponse =
      await makeGraphqlAPIRequest(firstPageOperation).expect(200);

    const firstPagePeople = firstPageResponse.body.data.people.edges.map(
      (edge: any) => edge.node,
    );

    expect(firstPagePeople).toHaveLength(2);

    expect(firstPagePeople[0].name.firstName).toBe('Charlie');
    expect(firstPagePeople[0].name.lastName).toBe('Davis');
    expect(firstPagePeople[1].name.firstName).toBe('Bob');
    expect(firstPagePeople[1].name.lastName).toBe('Williams');

    const secondPageOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      orderBy: {
        name: {
          firstName: 'DescNullsLast',
          lastName: 'DescNullsLast',
        },
      },
      first: 2,
      after: firstPageResponse.body.data.people.pageInfo.endCursor,
    });

    const secondPageResponse =
      await makeGraphqlAPIRequest(secondPageOperation).expect(200);

    const secondPagePeople = secondPageResponse.body.data.people.edges.map(
      (edge: any) => edge.node,
    );

    expect(secondPagePeople).toHaveLength(2);

    expect(secondPagePeople[0].name.firstName).toBe('Bob');
    expect(secondPagePeople[0].name.lastName).toBe('Johnson');
    expect(secondPagePeople[1].name.firstName).toBe('Alice');
    expect(secondPagePeople[1].name.lastName).toBe('Smith');
  });

  it('should support backward pagination with fullName composite field in ascending order', async () => {
    const allPeopleOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      orderBy: {
        name: {
          firstName: 'AscNullsLast',
          lastName: 'AscNullsLast',
        },
      },
    });

    const allPeopleResponse =
      await makeGraphqlAPIRequest(allPeopleOperation).expect(200);

    const allPeople = allPeopleResponse.body.data.people.edges.map(
      (edge: any) => edge.node,
    );
    const lastPersonCursor =
      allPeopleResponse.body.data.people.pageInfo.endCursor;

    const backwardPageOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      orderBy: {
        name: {
          firstName: 'AscNullsLast',
          lastName: 'AscNullsLast',
        },
      },
      last: 2,
      before: lastPersonCursor,
    });

    const backwardPageResponse = await makeGraphqlAPIRequest(
      backwardPageOperation,
    ).expect(200);

    const backwardPagePeople = backwardPageResponse.body.data.people.edges.map(
      (edge: any) => edge.node,
    );

    expect(backwardPagePeople).toHaveLength(2);

    expect(backwardPagePeople[0].id).toBe(allPeople.at(-3)?.id);
    expect(backwardPagePeople[1].id).toBe(allPeople.at(-2)?.id);
  });
});
