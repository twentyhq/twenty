import {
  FAKE_PERSON_ID,
  PERSON_1_ID,
} from 'test/integration/constants/mock-person-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

describe.skip('Core REST API Find One endpoint', () => {
  let personCity: string;

  beforeAll(async () => {
    personCity = generateRecordName(PERSON_1_ID);

    // Create a test person to retrieve
    await makeRestAPIRequest({
      method: 'post',
      path: '/people',
      body: {
        id: PERSON_1_ID,
        city: personCity,
      },
    }).expect(201);
  });

  afterAll(async () => {
    // Clean up the test person
    await makeRestAPIRequest({
      method: 'delete',
      path: `/people/${PERSON_1_ID}`,
    }).expect(200);
  });

  it('4.a. should retrieve a person by ID', async () => {
    const response = await makeRestAPIRequest({
      method: 'get',
      path: `/people/${PERSON_1_ID}`,
    }).expect(200);

    const person = response.body.data.person;

    expect(person).toBeDefined();
    expect(person.id).toBe(PERSON_1_ID);
    expect(person.city).toBe(personCity);
  });

  it('4.b. should return null when trying to retrieve a non-existing person', async () => {
    const response = await makeRestAPIRequest({
      method: 'get',
      path: `/people/${FAKE_PERSON_ID}`,
    }).expect(200);

    const person = response.body.data.person;

    expect(person).toBeNull();
  });

  it('4.c. should return an UnauthorizedException when no token is provided', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: `/people/${PERSON_1_ID}`,
      headers: { authorization: '' },
    })
      .expect(401)
      .expect((res) => {
        expect(res.body.error).toBe('UNAUTHENTICATED');
      });
  });

  it('4.d. should return an UnauthorizedException when an invalid token is provided', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: `/people/${PERSON_1_ID}`,
      headers: { authorization: 'Bearer invalid-token' },
    })
      .expect(401)
      .expect((res) => {
        expect(res.body.error).toBe('UNAUTHENTICATED');
      });
  });

  it('4.e. should return an UnauthorizedException when an expired token is provided', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: `/people/${PERSON_1_ID}`,
      headers: { authorization: `Bearer ${EXPIRED_ACCESS_TOKEN}` },
    })
      .expect(401)
      .expect((res) => {
        expect(res.body.error).toBe('UNAUTHENTICATED');
        expect(res.body.messages[0]).toBe('Token has expired.');
      });
  });
});
