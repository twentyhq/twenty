import {
  FAKE_PERSON_ID,
  PERSON_2_ID,
} from 'test/integration/constants/mock-person-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

describe('Core REST API Create One endpoint', () => {
  const deleteTestPerson = async () =>
    await makeRestAPIRequest({
      method: 'delete',
      path: `/people/${PERSON_2_ID}`,
    });

  beforeAll(deleteTestPerson);
  afterAll(deleteTestPerson);

  it('should create a new person', async () => {
    const personCity = generateRecordName(PERSON_2_ID);
    const requestBody = {
      id: PERSON_2_ID,
      city: personCity,
    };

    await makeRestAPIRequest({
      method: 'post',
      path: `/people`,
      body: requestBody,
    })
      .expect(201)
      .expect((res) => {
        const createdPerson = res.body.data.createPerson;

        expect(createdPerson.id).toBe(PERSON_2_ID);
        expect(createdPerson.city).toBe(personCity);
      });
  });

  it('should return a BadRequestException when trying to create a person with an existing ID', async () => {
    const personCity = generateRecordName(PERSON_2_ID);
    const requestBody = {
      id: PERSON_2_ID,
      city: personCity,
    };

    await makeRestAPIRequest({
      method: 'post',
      path: `/people`,
      body: requestBody,
    })
      .expect(400)
      .expect((res) => {
        expect(res.body.messages[0]).toContain(`Record already exists`);
        expect(res.body.error).toBe('BadRequestException');
      });
  });

  it('should return an UnauthorizedException when no token is provided', async () => {
    await makeRestAPIRequest({
      method: 'post',
      path: `/people`,
      headers: { authorization: '' },
      body: { id: FAKE_PERSON_ID, city: 'FakeCity' },
    })
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe('FORBIDDEN_EXCEPTION');
        expect(res.body.messages[0]).toBe('Missing authentication token');
      });
  });

  it('should return an Unauthenticated when an invalid token is provided', async () => {
    await makeRestAPIRequest({
      method: 'post',
      path: `/people`,
      body: { id: FAKE_PERSON_ID, city: 'FakeCity' },
      headers: { authorization: `Bearer ${INVALID_ACCESS_TOKEN}` },
    })
      .expect(401)
      .expect((res) => {
        expect(res.body.error).toBe('UNAUTHENTICATED');
        expect(res.body.messages[0]).toBe('Token invalid.');
      });
  });

  it('should return an Unauthenticated when no token is provided', async () => {
    await makeRestAPIRequest({
      method: 'post',
      path: `/people`,
      body: { id: FAKE_PERSON_ID, city: 'FakeCity' },
      headers: { authorization: 'Bearer invalid-token' },
    })
      .expect(401)
      .expect((res) => {
        expect(res.body.error).toBe('UNAUTHENTICATED');
        expect(res.body.messages[0]).toBe('No payload');
      });
  });

  it('should return an Unauthenticated when an expired token is provided', async () => {
    await makeRestAPIRequest({
      method: 'post',
      path: `/people`,
      body: { id: FAKE_PERSON_ID, city: 'FakeCity' },
      headers: { authorization: `Bearer ${EXPIRED_ACCESS_TOKEN}` },
    })
      .expect(401)
      .expect((res) => {
        expect(res.body.error).toBe('UNAUTHENTICATED');
        expect(res.body.messages[0]).toBe('Token has expired.');
      });
  });
});
