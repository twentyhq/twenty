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
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';
import { makeGraphqlAPIRequest } from 'test/integration/utils/make-graphql-api-request.util';

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

      const response = await makeGraphqlAPIRequest({ operation: graphqlOperation });
      expect(response.rawResponse.status).toBe(200);
      expect(response.errors).toBeUndefined();
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

    const firstPageResponse = await makeGraphqlAPIRequest<any>({ operation: firstPageOperation });
    expect(firstPageResponse.rawResponse.status).toBe(200);
    expect(firstPageResponse.errors).toBeUndefined();

    const firstPageData = firstPageResponse.data;
    const firstPagePeople = firstPageData.people.edges.map(
      (edge: any) => edge.node,
    );
    const firstPageCursor = firstPageData.people.pageInfo.endCursor;

    expect(firstPagePeople).toHaveLength(2);
    expect(firstPageData.people.pageInfo.hasNextPage).toBe(true);

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

    const secondPageResponse = await makeGraphqlAPIRequest<any>({ operation: secondPageOperation });
    expect(secondPageResponse.rawResponse.status).toBe(200);
    expect(secondPageResponse.errors).toBeUndefined();

    const secondPageData = secondPageResponse.data;
    const secondPagePeople = secondPageData.people.edges.map(
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
      after: secondPageData.people.pageInfo.endCursor,
    });

    const thirdPageResponse = await makeGraphqlAPIRequest<any>({ operation: thirdPageOperation });
    expect(thirdPageResponse.rawResponse.status).toBe(200);
    expect(thirdPageResponse.errors).toBeUndefined();

    const thirdPageData = thirdPageResponse.data;
    const thirdPagePeople = thirdPageData.people.edges.map(
      (edge: any) => edge.node,
    );

    expect(thirdPagePeople).toHaveLength(1);
    expect(thirdPagePeople[0].name.firstName).toBe('Charlie');
    expect(thirdPagePeople[0].name.lastName).toBe('Davis');
    expect(thirdPageData.people.pageInfo.hasNextPage).toBe(false);
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

    const firstPageResponse = await makeGraphqlAPIRequest<any>({ operation: firstPageOperation });
    expect(firstPageResponse.rawResponse.status).toBe(200);
    expect(firstPageResponse.errors).toBeUndefined();

    const firstPageData = firstPageResponse.data;
    const firstPagePeople = firstPageData.people.edges.map(
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
      after: firstPageData.people.pageInfo.endCursor,
    });

    const secondPageResponse = await makeGraphqlAPIRequest<any>({ operation: secondPageOperation });
    expect(secondPageResponse.rawResponse.status).toBe(200);
    expect(secondPageResponse.errors).toBeUndefined();

    const secondPageData = secondPageResponse.data;
    const secondPagePeople = secondPageData.people.edges.map(
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

    const allPeopleResponse = await makeGraphqlAPIRequest<any>({ operation: allPeopleOperation });
    expect(allPeopleResponse.rawResponse.status).toBe(200);
    expect(allPeopleResponse.errors).toBeUndefined();

    const allPeopleData = allPeopleResponse.data;
    const allPeople = allPeopleData.people.edges.map(
      (edge: any) => edge.node,
    );
    const lastPersonCursor = allPeopleData.people.pageInfo.endCursor;

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

    const backwardPageResponse = await makeGraphqlAPIRequest<any>({ operation: backwardPageOperation });
    expect(backwardPageResponse.rawResponse.status).toBe(200);
    expect(backwardPageResponse.errors).toBeUndefined();

    const backwardPageData = backwardPageResponse.data;
    const backwardPagePeople = backwardPageData.people.edges.map(
      (edge: any) => edge.node,
    );

    expect(backwardPagePeople).toHaveLength(2);

    expect(backwardPagePeople[0].id).toBe(allPeople.at(-2)?.id);
    expect(backwardPagePeople[1].id).toBe(allPeople.at(-3)?.id);
  });
});
