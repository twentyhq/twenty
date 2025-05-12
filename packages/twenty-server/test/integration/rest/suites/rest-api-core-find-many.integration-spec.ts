import {
  TEST_PERSON_1_ID,
  TEST_PERSON_2_ID,
  TEST_PERSON_3_ID,
  TEST_PERSON_4_ID,
} from 'test/integration/constants/test-person-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import { TEST_COMPANY_1_ID } from 'test/integration/constants/test-company-ids.constants';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';
import { TEST_PRIMARY_LINK_URL } from 'test/integration/constants/test-primary-link-url.constant';

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
    }).expect(200);

    const people = response.body.data.people;
    const pageInfo = response.body.pageInfo;
    const totalCount = response.body.totalCount;

    expect(people).not.toBeNull();
    expect(Array.isArray(people)).toBe(true);
    expect(people.length).toBeGreaterThanOrEqual(testPersonIds.length);

    // Check that our test people are included in the results
    for (const personId of testPersonIds) {
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

  it('should handle invalid cursor gracefully', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: '/people?starting_after=invalid-cursor',
    })
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe('BadRequestException');
        expect(res.body.messages[0]).toContain('Invalid cursor');
      });
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
      TEST_PRIMARY_LINK_URL,
    );

    expect(person.company.people).not.toBeDefined();
  });

  it('should support depth 2 parameter', async () => {
    const response = await makeRestAPIRequest({
      method: 'get',
      path: '/people?depth=2',
    }).expect(200);

    const people = response.body.data.people;

    const person = people[0];

    expect(person.company.people).toBeDefined();

    const depth2Person = person.company.people.find((p) => p.id === person.id);

    expect(depth2Person).toBeDefined();
  });
});
