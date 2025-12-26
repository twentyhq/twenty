import { TEST_COMPANY_1_ID } from 'test/integration/constants/test-company-ids.constants';
import {
  TEST_PERSON_1_ID,
  TEST_PERSON_2_ID,
  TEST_PERSON_3_ID,
  TEST_PERSON_4_ID,
} from 'test/integration/constants/test-person-ids.constants';
import {
  TEST_PRIMARY_LINK_URL,
  TEST_PRIMARY_LINK_URL_WIITHOUT_TRAILING_SLASH,
} from 'test/integration/constants/test-primary-link-url.constant';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

describe('Core REST API Find Many endpoint', () => {
  const testPersonIds = [
    TEST_PERSON_1_ID,
    TEST_PERSON_2_ID,
    TEST_PERSON_3_ID,
    TEST_PERSON_4_ID,
  ];
  const testPersonCities: Record<string, string> = {};

  beforeAll(async () => {
    await deleteAllRecords('person');

    await makeRestAPIRequest({
      method: 'post',
      path: '/companies',
      body: {
        id: TEST_COMPANY_1_ID,
        domainName: {
          primaryLinkUrl: TEST_PRIMARY_LINK_URL,
        },
      },
    });

    let index = 0;

    for (const personId of testPersonIds) {
      const city = generateRecordName(personId);

      testPersonCities[personId] = city;

      await makeRestAPIRequest({
        method: 'post',
        path: '/people',
        body: {
          id: personId,
          city: city,
          position: index,
          companyId: TEST_COMPANY_1_ID,
        },
      });

      index++;
    }
  });

  it('should retrieve all people with pagination metadata', async () => {
    const response = await makeRestAPIRequest({
      method: 'get',
      path: '/people',
    });

    expect(response.status).toBe(200);

    const people = response.body.data.people;
    const pageInfo = response.body.pageInfo;
    const totalCount = response.body.totalCount;

    expect(people).not.toBeNull();
    expect(Array.isArray(people)).toBe(true);
    expect(people.length).toBeGreaterThanOrEqual(testPersonIds.length);

    // Check that our test people are included in the results
    for (const personId of testPersonIds) {
      // @ts-expect-error legacy noImplicitAny
      const person = people.find((p) => p.id === personId);

      expect(person).toBeDefined();
      expect(person.city).toBe(testPersonCities[personId]);
    }

    // Check pagination metadata
    expect(pageInfo).toBeDefined();
    expect(pageInfo.startCursor).toBeDefined();
    expect(pageInfo.endCursor).toBeDefined();
    expect(typeof totalCount).toBe('number');
    expect(totalCount).toEqual(testPersonIds.length);
    expect(response.body.pageInfo.hasNextPage).toBe(false);
  });

  it('should limit results based on the limit parameter', async () => {
    const limit = testPersonIds.length - 1;
    const response = await makeRestAPIRequest({
      method: 'get',
      path: `/people?limit=${limit}`,
    }).expect(200);

    const people = response.body.data.people;

    expect(people).not.toBeNull();
    expect(Array.isArray(people)).toBe(true);
    expect(people.length).toEqual(limit);
    expect(response.body.totalCount).toEqual(testPersonIds.length);
    expect(response.body.pageInfo.hasNextPage).toBe(true);
  });

  it('should return filtered totalCount', async () => {
    const response = await makeRestAPIRequest({
      method: 'get',
      path: `/people?filter=position[lte]:1`,
    }).expect(200);

    const people = response.body.data.people;

    expect(people).not.toBeNull();
    expect(Array.isArray(people)).toBe(true);
    expect(people.length).toEqual(2);
    expect(response.body.totalCount).toEqual(2);
    expect(response.body.pageInfo.hasNextPage).toBe(false);
  });

  it('should filter results based on filter parameters', async () => {
    const response = await makeRestAPIRequest({
      method: 'get',
      path: '/people?filter=position[lt]:2',
    }).expect(200);

    const filteredPeople = response.body.data.people;

    expect(filteredPeople).toBeDefined();
    expect(Array.isArray(filteredPeople)).toBe(true);
    expect(filteredPeople.length).toBe(2);
  });

  it('should support cursor-based pagination with starting_after', async () => {
    const initialResponse = await makeRestAPIRequest({
      method: 'get',
      path: '/people?limit=2',
    }).expect(200);

    const people = initialResponse.body.data.people;
    const startCursor = initialResponse.body.pageInfo.startCursor;

    expect(people).toBeDefined();
    expect(people.length).toBe(2);
    expect(startCursor).toBeDefined();

    const nextPageResponse = await makeRestAPIRequest({
      method: 'get',
      path: `/people?starting_after=${startCursor}&limit=1`,
    }).expect(200);

    const nextPagePeople = nextPageResponse.body.data.people;

    expect(nextPagePeople).toBeDefined();
    expect(nextPagePeople.length).toBe(1);
    expect(nextPagePeople[0].id).toBe(people[1].id);
  });

  it('should support cursor-based pagination with ending_before', async () => {
    const initialResponse = await makeRestAPIRequest({
      method: 'get',
      path: '/people?limit=4',
    }).expect(200);

    const people = initialResponse.body.data.people;
    const endCursor = initialResponse.body.pageInfo.endCursor;

    expect(people).toBeDefined();
    expect(people.length).toBe(4);
    expect(endCursor).toBeDefined();

    const nextPageResponse = await makeRestAPIRequest({
      method: 'get',
      path: `/people?ending_before=${endCursor}&limit=2`,
    }).expect(200);

    const nextPagePeople = nextPageResponse.body.data.people;

    expect(nextPagePeople).toBeDefined();
    expect(nextPagePeople.length).toBe(2);
    expect(nextPagePeople[0].id).toBe(people[1].id);
    expect(nextPagePeople[1].id).toBe(people[2].id);
  });

  it('should support ordering Asc of results', async () => {
    const ascResponse = await makeRestAPIRequest({
      method: 'get',
      path: '/people?order_by=position[AscNullsLast]',
    }).expect(200);

    const ascPeople = ascResponse.body.data.people;

    expect(ascPeople).toEqual(
      [...ascPeople].sort((a, b) => a.position - b.position),
    );
  });

  it('should support filtering on a relation field id', async () => {
    const response = await makeRestAPIRequest({
      method: 'get',
      path: `/people?filter=companyId[in]:["${TEST_COMPANY_1_ID}"]`,
    }).expect(200);

    const filteredPeople = response.body.data.people;

    expect(filteredPeople.length).toBeGreaterThan(0);
  });

  // TODO: Refacto-common - Uncomment this after https://github.com/twentyhq/core-team-issues/issues/1627

  //   it('should fail to filter on a relation field name', async () => {
  //     const response = await makeRestAPIRequest({
  //       method: 'get',
  //       path: `/people?filter=company[in]:["${TEST_COMPANY_1_ID}"]`,
  //     });

  //     expect(response.body).toMatchInlineSnapshot(`
  // {
  //   "error": "BadRequestException",
  //   "messages": [
  //     "field 'company' does not exist in 'person' object",
  //   ],
  //   "statusCode": 400,
  // }
  // `);
  //   });

  it('should support ordering Desc of results', async () => {
    const descResponse = await makeRestAPIRequest({
      method: 'get',
      path: '/people?order_by=position[DescNullsLast]',
    }).expect(200);

    const descPeople = descResponse.body.data.people;

    expect(descPeople).toEqual(
      [...descPeople].sort((a, b) => -(a.position - b.position)),
    );
  });

  it('should support pagination with ordering', async () => {
    const descResponse = await makeRestAPIRequest({
      method: 'get',
      path: '/people?order_by=position[DescNullsLast]&limit=2',
    }).expect(200);

    const descPeople = descResponse.body.data.people;
    const endingBefore = descResponse.body.pageInfo.endCursor;
    const lastPosition = descPeople[descPeople.length - 1].position;

    expect(descResponse.body.pageInfo.hasNextPage).toBe(true);
    expect(descPeople.length).toEqual(2);
    expect(lastPosition).toEqual(2);

    const descResponseWithPaginationResponse = await makeRestAPIRequest({
      method: 'get',
      path: `/people?order_by=position[DescNullsLast]&limit=2&starting_after=${endingBefore}`,
    }).expect(200);

    const descResponseWithPagination =
      descResponseWithPaginationResponse.body.data.people;

    expect(descResponseWithPagination.length).toEqual(2);
    expect(descResponseWithPagination[0].position).toEqual(lastPosition - 1);
  });

  it('should handle invalid cursor gracefully', async () => {
    const response = await makeRestAPIRequest({
      method: 'get',
      path: '/people?starting_after=invalid-cursor',
    });

    expect(response.body.error).toBe('BadRequestException');
    expect(response.body.messages[0]).toContain('Invalid cursor');
  });

  it('should combine filtering, ordering, and pagination', async () => {
    const response = await makeRestAPIRequest({
      method: 'get',
      path: '/people?filter=position[gt]:0&order_by=city[AscNullsFirst]&limit=2',
    }).expect(200);

    const people = response.body.data.people;

    const pageInfo = response.body.pageInfo;

    expect(people).toBeDefined();
    expect(people.length).toBeLessThanOrEqual(2);
    expect(pageInfo).toBeDefined();

    expect(people).toEqual([...people].sort((a, b) => a.city - b.city));
  });

  it('should should throw an error when trying to order by a composite field', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: '/people?order_by=name[AscNullsLast]',
    }).expect(400);
  });

  // TODO: Uncomment this test when we support composite fields ordering in the rest api

  // it('should support pagination with fullName composite field ordering', async () => {
  //   await deleteAllRecords('person');

  //   const testPeople = [
  //     {
  //       id: TEST_PERSON_1_ID,
  //       firstName: 'Alice',
  //       lastName: 'Brown',
  //       position: 0,
  //     },
  //     {
  //       id: TEST_PERSON_2_ID,
  //       firstName: 'Alice',
  //       lastName: 'Smith',
  //       position: 1,
  //     },
  //     {
  //       id: TEST_PERSON_3_ID,
  //       firstName: 'Bob',
  //       lastName: 'Johnson',
  //       position: 2,
  //     },
  //     {
  //       id: TEST_PERSON_4_ID,
  //       firstName: 'Bob',
  //       lastName: 'Williams',
  //       position: 3,
  //     },
  //     {
  //       id: TEST_PERSON_5_ID,
  //       firstName: 'Charlie',
  //       lastName: 'Davis',
  //       position: 4,
  //     },
  //   ];

  //   for (const person of testPeople) {
  //     await makeRestAPIRequest({
  //       method: 'post',
  //       path: '/people',
  //       body: {
  //         id: person.id,
  //         name: {
  //           firstName: person.firstName,
  //           lastName: person.lastName,
  //         },
  //       },
  //     });
  //   }

  //   const firstPageResponse = await makeRestAPIRequest({
  //     method: 'get',
  //     path: '/people?order_by=name[AscNullsLast]&limit=2',
  //   }).expect(200);

  //   const firstPagePeople = firstPageResponse.body.data.people;
  //   const firstPageCursor = firstPageResponse.body.pageInfo.endCursor;

  //   expect(firstPagePeople).toHaveLength(2);
  //   expect(firstPageResponse.body.pageInfo.hasNextPage).toBe(true);

  //   expect(firstPagePeople[0].name.firstName).toBe('Alice');
  //   expect(firstPagePeople[0].name.lastName).toBe('Brown');
  //   expect(firstPagePeople[1].name.firstName).toBe('Alice');
  //   expect(firstPagePeople[1].name.lastName).toBe('Smith');

  //   const secondPageResponse = await makeRestAPIRequest({
  //     method: 'get',
  //     path: `/people?order_by=name[AscNullsLast]&limit=2&starting_after=${firstPageCursor}`,
  //   }).expect(200);

  //   const secondPagePeople = secondPageResponse.body.data.people;

  //   expect(secondPagePeople).toHaveLength(2);

  //   expect(secondPagePeople[0].name.firstName).toBe('Bob');
  //   expect(secondPagePeople[0].name.lastName).toBe('Johnson');
  //   expect(secondPagePeople[1].name.firstName).toBe('Bob');
  //   expect(secondPagePeople[1].name.lastName).toBe('Williams');

  //   const firstPageIds = firstPagePeople.map((p: { id: string }) => p.id);
  //   const secondPageIds = secondPagePeople.map((p: { id: string }) => p.id);
  //   const intersection = firstPageIds.filter((id: string) =>
  //     secondPageIds.includes(id),
  //   );

  //   expect(intersection).toHaveLength(0);

  //   const thirdPageResponse = await makeRestAPIRequest({
  //     method: 'get',
  //     path: `/people?order_by=name[AscNullsLast]&limit=2&starting_after=${secondPageResponse.body.pageInfo.endCursor}`,
  //   }).expect(200);

  //   const thirdPagePeople = thirdPageResponse.body.data.people;

  //   expect(thirdPagePeople).toHaveLength(1);
  //   expect(thirdPagePeople[0].name.firstName).toBe('Charlie');
  //   expect(thirdPagePeople[0].name.lastName).toBe('Davis');
  //   expect(thirdPageResponse.body.pageInfo.hasNextPage).toBe(false);
  // });

  // it('should support cursor-based pagination with fullName descending order', async () => {
  //   const firstPageResponse = await makeRestAPIRequest({
  //     method: 'get',
  //     path: '/people?order_by=name[DescNullsLast]&limit=2',
  //   }).expect(200);

  //   const firstPagePeople = firstPageResponse.body.data.people;

  //   expect(firstPagePeople).toHaveLength(2);

  //   expect(firstPagePeople[0].name.firstName).toBe('Charlie');
  //   expect(firstPagePeople[0].name.lastName).toBe('Davis');
  //   expect(firstPagePeople[1].name.firstName).toBe('Bob');
  //   expect(firstPagePeople[1].name.lastName).toBe('Williams');

  //   const secondPageResponse = await makeRestAPIRequest({
  //     method: 'get',
  //     path: `/people?order_by=name[DescNullsLast]&limit=2&starting_after=${firstPageResponse.body.pageInfo.endCursor}`,
  //   }).expect(200);

  //   const secondPagePeople = secondPageResponse.body.data.people;

  //   expect(secondPagePeople).toHaveLength(2);

  //   expect(secondPagePeople[0].name.firstName).toBe('Bob');
  //   expect(secondPagePeople[0].name.lastName).toBe('Johnson');
  //   expect(secondPagePeople[1].name.firstName).toBe('Alice');
  //   expect(secondPagePeople[1].name.lastName).toBe('Smith');
  // });

  // it('should support backward pagination with fullName composite field', async () => {
  //   const allPeopleResponse = await makeRestAPIRequest({
  //     method: 'get',
  //     path: '/people?order_by=name.firstName[AscNullsLast],name.lastName[AscNullsLast]',
  //   }).expect(200);

  //   const allPeople = allPeopleResponse.body.data.people;
  //   const lastPersonCursor = allPeopleResponse.body.pageInfo.endCursor;

  //   const backwardPageResponse = await makeRestAPIRequest({
  //     method: 'get',
  //     path: `/people?order_by=name[AscNullsLast]&limit=2&ending_before=${lastPersonCursor}`,
  //   }).expect(200);

  //   const backwardPagePeople = backwardPageResponse.body.data.people;

  //   expect(backwardPagePeople).toHaveLength(2);

  //   expect(backwardPagePeople[0].id).toBe(allPeople[allPeople.length - 3].id);
  //   expect(backwardPagePeople[1].id).toBe(allPeople[allPeople.length - 2].id);
  // });

  it('should support depth 0 parameter', async () => {
    const response = await makeRestAPIRequest({
      method: 'get',
      path: '/people?depth=0',
    }).expect(200);

    const people = response.body.data.people;

    expect(people).toBeDefined();

    const person = people[0];

    expect(person).toBeDefined();
    expect(person.companyId).toBeDefined();
    expect(person.company).not.toBeDefined();
  });

  it('should support depth 1 parameter', async () => {
    const response = await makeRestAPIRequest({
      method: 'get',
      path: '/people?depth=1',
    }).expect(200);

    const people = response.body.data.people;

    const person = people[0];

    expect(person.company).toBeDefined();
    expect(person.company.domainName.primaryLinkUrl).toBe(
      TEST_PRIMARY_LINK_URL_WIITHOUT_TRAILING_SLASH,
    );

    expect(person.company.people).not.toBeDefined();
  });

  it('should not support depth 2 parameter', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: '/people?depth=2',
    }).expect(400);
  });
});
