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
    const response = await makeRestAPIRequest({
      method: 'get',
      path: '/people',
    }).expect(200);

    for (const person of response.body.data.people) {
      await makeRestAPIRequest({
        method: 'delete',
        path: `/people/${person.id}`,
      });
    }

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
    expect(people.length).toBeLessThanOrEqual(limit);
    expect(response.body.totalCount).toEqual(testPersonIds.length);
  });

  it('should filter results based on filter parameters', async () => {
    const response = await makeRestAPIRequest({
      method: 'get',
      path: '/people?filter=position[gte]:1',
    }).expect(200);

    const filteredPeople = response.body.data.people;

    expect(filteredPeople).toBeDefined();
    expect(Array.isArray(filteredPeople)).toBe(true);
    expect(filteredPeople.length).toBe(2);
  });

  it('should support cursor-based pagination with startingAfter', async () => {
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
      path: `/people?startingAfter=${startCursor}&limit=1`,
    }).expect(200);

    const nextPagePeople = nextPageResponse.body.data.people;

    expect(nextPagePeople).toBeDefined();
    expect(nextPagePeople.length).toBe(1);
    expect(nextPagePeople[0].id).toBe(people[1].id);
  });

  it('should support cursor-based pagination with endingBefore', async () => {
    const initialResponse = await makeRestAPIRequest({
      method: 'get',
      path: '/people?limit=2',
    }).expect(200);

    const people = initialResponse.body.data.people;
    const endCursor = initialResponse.body.pageInfo.endCursor;

    expect(people).toBeDefined();
    expect(people.length).toBe(2);
    expect(endCursor).toBeDefined();

    const nextPageResponse = await makeRestAPIRequest({
      method: 'get',
      path: `/people?endingBefore=${endCursor}&limit=1`,
    }).expect(200);

    const nextPagePeople = nextPageResponse.body.data.people;

    expect(nextPagePeople).toBeDefined();
    expect(nextPagePeople.length).toBe(1);
    expect(nextPagePeople[0].id).toBe(people[0].id);
  });

  it('should support ordering of results', async () => {
    const ascResponse = await makeRestAPIRequest({
      method: 'get',
      path: '/people?orderBy=position[AscNullsLast]',
    }).expect(200);

    const ascPeople = ascResponse.body.data.people;

    for (let i = 1; i < ascPeople.length; i++) {
      if (ascPeople[i - 1].position && ascPeople[i].position) {
        expect(ascPeople[i - 1].position <= ascPeople[i].position).toBe(true);
      }
    }

    const descResponse = await makeRestAPIRequest({
      method: 'get',
      path: '/people?orderBy=position[DescNullsLast]',
    }).expect(200);

    const descPeople = descResponse.body.data.people;

    for (let i = 1; i < descPeople.length; i++) {
      if (descPeople[i - 1].position && descPeople[i].position) {
        expect(descPeople[i - 1].position >= descPeople[i].position).toBe(true);
      }
    }
  });

  it('should handle invalid cursor gracefully', async () => {
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

  it('should combine filtering, ordering, and pagination', async () => {
    const response = await makeRestAPIRequest({
      method: 'get',
      path: '/people?filter=position[gt]:0&orderBy=city[AscNullsFirst]&limit=2',
    }).expect(200);

    const people = response.body.data.people;
    const pageInfo = response.body.pageInfo;

    expect(people).toBeDefined();
    expect(people.length).toBeLessThanOrEqual(2);
    expect(pageInfo).toBeDefined();

    // Check that cities are in ascending order
    for (let i = 1; i < people.length; i++) {
      if (people[i - 1].city && people[i].city) {
        expect(people[i - 1].city <= people[i].city).toBe(true);
      }
    }
  });
});
