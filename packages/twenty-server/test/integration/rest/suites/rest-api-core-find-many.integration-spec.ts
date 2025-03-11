import {
  PERSON_1_ID,
  PERSON_2_ID,
  PERSON_3_ID,
} from 'test/integration/constants/mock-person-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

describe('Core REST API Find Many endpoint', () => {
  const testPersonIds = [PERSON_1_ID, PERSON_2_ID, PERSON_3_ID];
  const testPersonCities: Record<string, string> = {};

  beforeAll(async () => {
    // Create test people with different cities for testing
    for (const personId of testPersonIds) {
      const city = generateRecordName(personId);

      testPersonCities[personId] = city;

      await makeRestAPIRequest({
        method: 'post',
        path: '/people',
        body: {
          id: personId,
          city: city,
          // Add different jobTitles to test filtering
          jobTitle: `Job ${personId.slice(0, 4)}`,
        },
      }).expect(201);
    }
  });

  afterAll(async () => {
    // Clean up test people
    for (const personId of testPersonIds) {
      await makeRestAPIRequest({
        method: 'delete',
        path: `/people/${personId}`,
      }).expect(200);
    }
  });

  it('5.a. should retrieve all people with pagination metadata', async () => {
    const response = await makeRestAPIRequest({
      method: 'get',
      path: '/people',
    }).expect(200);

    const people = response.body.data.people;
    const pageInfo = response.body.data.pageInfo;
    const totalCount = response.body.data.totalCount;

    expect(people).toBeDefined();
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
    expect(totalCount).toBeGreaterThanOrEqual(testPersonIds.length);
  });

  it('5.b. should limit results based on the limit parameter', async () => {
    const limit = 2;
    const response = await makeRestAPIRequest({
      method: 'get',
      path: `/people?limit=${limit}`,
    }).expect(200);

    const people = response.body.data.people;

    expect(people).toBeDefined();
    expect(Array.isArray(people)).toBe(true);
    expect(people.length).toBeLessThanOrEqual(limit);
  });

  it('5.c. should filter results based on filter parameters', async () => {
    // Filter by jobTitle starting with "Job"
    const response = await makeRestAPIRequest({
      method: 'get',
      path: '/people?filter[jobTitle][contains]=Job',
    }).expect(200);

    const people = response.body.data.people;

    expect(people).toBeDefined();
    expect(Array.isArray(people)).toBe(true);
    expect(people.length).toBeGreaterThanOrEqual(testPersonIds.length);

    // All returned people should have jobTitle containing "Job"
    for (const person of people) {
      expect(person.jobTitle).toContain('Job');
    }
  });

  it('5.d. should support cursor-based pagination with startingAfter', async () => {
    // First, get initial results to get a cursor
    const initialResponse = await makeRestAPIRequest({
      method: 'get',
      path: '/people?limit=1',
    }).expect(200);

    const firstPerson = initialResponse.body.data.people[0];
    const endCursor = initialResponse.body.data.pageInfo.endCursor;

    expect(firstPerson).toBeDefined();
    expect(endCursor).toBeDefined();

    // Now use the cursor to get the next page
    const nextPageResponse = await makeRestAPIRequest({
      method: 'get',
      path: `/people?startingAfter=${endCursor}&limit=1`,
    }).expect(200);

    const nextPagePeople = nextPageResponse.body.data.people;

    expect(nextPagePeople).toBeDefined();
    expect(nextPagePeople.length).toBe(1);
    expect(nextPagePeople[0].id).not.toBe(firstPerson.id);
  });

  it('5.e. should support cursor-based pagination with endingBefore', async () => {
    // First, get results to get a cursor from the second page
    const initialResponse = await makeRestAPIRequest({
      method: 'get',
      path: '/people?limit=2',
    }).expect(200);

    const people = initialResponse.body.data.people;
    const startCursor = initialResponse.body.data.pageInfo.startCursor;

    expect(people.length).toBe(2);
    expect(startCursor).toBeDefined();

    // Now use the cursor to get the previous page (which should be empty in this case)
    const prevPageResponse = await makeRestAPIRequest({
      method: 'get',
      path: `/people?endingBefore=${startCursor}&limit=1`,
    }).expect(200);

    const prevPagePeople = prevPageResponse.body.data.people;
    const pageInfo = prevPageResponse.body.data.pageInfo;

    // Since we're at the beginning, there might not be previous results
    expect(prevPagePeople).toBeDefined();
    expect(pageInfo.hasPreviousPage).toBeDefined();
  });

  it('5.f. should support ordering of results', async () => {
    // Order by city in ascending order
    const ascResponse = await makeRestAPIRequest({
      method: 'get',
      path: '/people?orderBy[city]=ASC',
    }).expect(200);

    const ascPeople = ascResponse.body.data.people;

    // Check that cities are in ascending order
    for (let i = 1; i < ascPeople.length; i++) {
      if (ascPeople[i - 1].city && ascPeople[i].city) {
        expect(ascPeople[i - 1].city <= ascPeople[i].city).toBe(true);
      }
    }

    // Order by city in descending order
    const descResponse = await makeRestAPIRequest({
      method: 'get',
      path: '/people?orderBy[city]=DESC',
    }).expect(200);

    const descPeople = descResponse.body.data.people;

    // Check that cities are in descending order
    for (let i = 1; i < descPeople.length; i++) {
      if (descPeople[i - 1].city && descPeople[i].city) {
        expect(descPeople[i - 1].city >= descPeople[i].city).toBe(true);
      }
    }
  });

  it('5.g. should return an UnauthorizedException when no token is provided', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: '/people',
      headers: { authorization: '' },
    })
      .expect(401)
      .expect((res) => {
        expect(res.body.error).toBe('UNAUTHENTICATED');
      });
  });

  it('5.h. should return an UnauthorizedException when an invalid token is provided', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: '/people',
      headers: { authorization: 'Bearer invalid-token' },
    })
      .expect(401)
      .expect((res) => {
        expect(res.body.error).toBe('UNAUTHENTICATED');
      });
  });

  it('5.i. should handle invalid cursor gracefully', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: '/people?startingAfter=invalid-cursor',
    })
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe('BadRequestException');
        expect(res.body.messages[0]).toContain('Invalid cursor');
      });
  });

  it('5.j. should combine filtering, ordering, and pagination', async () => {
    const response = await makeRestAPIRequest({
      method: 'get',
      path: '/people?filter[jobTitle][contains]=Job&orderBy[city]=ASC&limit=2',
    }).expect(200);

    const people = response.body.data.people;
    const pageInfo = response.body.data.pageInfo;

    expect(people).toBeDefined();
    expect(people.length).toBeLessThanOrEqual(2);
    expect(pageInfo).toBeDefined();

    // Check that all returned people match the filter
    for (const person of people) {
      expect(person.jobTitle).toContain('Job');
    }

    // Check that cities are in ascending order
    for (let i = 1; i < people.length; i++) {
      if (people[i - 1].city && people[i].city) {
        expect(people[i - 1].city <= people[i].city).toBe(true);
      }
    }
  });
});
