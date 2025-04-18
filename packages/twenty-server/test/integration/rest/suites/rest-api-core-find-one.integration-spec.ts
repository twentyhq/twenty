import {
  NOT_EXISTING_PERSON_ID,
  PERSON_1_ID,
} from 'test/integration/constants/mock-person-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

describe('Core REST API Find One endpoint', () => {
  let personCity: string;

  beforeAll(async () => {
    personCity = generateRecordName(PERSON_1_ID);

    await makeRestAPIRequest({
      method: 'delete',
      path: `/people/${PERSON_1_ID}`,
    });

    await makeRestAPIRequest({
      method: 'post',
      path: '/people',
      body: {
        id: PERSON_1_ID,
        city: personCity,
      },
    });
  });

  it('should retrieve a person by ID', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: `/people/${PERSON_1_ID}`,
    })
      .expect(200)
      .expect((res) => {
        const person = res.body.data.person;

        expect(person).not.toBeNull();
        expect(person.id).toBe(PERSON_1_ID);
        expect(person.city).toBe(personCity);
      });
  });

  it('should return null when trying to retrieve a non-existing person', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: `/people/${NOT_EXISTING_PERSON_ID}`,
    })
      .expect(200)
      .expect((res) => {
        const person = res.body.data.person;

        expect(person).toBeNull();
      });
  });
});
