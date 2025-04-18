import { PERSON_1_ID } from 'test/integration/constants/mock-person-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

describe('Core REST API Create One endpoint', () => {
  beforeAll(
    async () =>
      await makeRestAPIRequest({
        method: 'delete',
        path: `/people/${PERSON_1_ID}`,
      }),
  );

  it('should create a new person', async () => {
    const personCity = generateRecordName(PERSON_1_ID);
    const requestBody = {
      id: PERSON_1_ID,
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

        expect(createdPerson.id).toBe(PERSON_1_ID);
        expect(createdPerson.city).toBe(personCity);
      });
  });

  it('should return a BadRequestException when trying to create a person with an existing ID', async () => {
    const personCity = generateRecordName(PERSON_1_ID);
    const requestBody = {
      id: PERSON_1_ID,
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
});
