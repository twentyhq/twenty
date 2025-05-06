import {
  NOT_EXISTING_TEST_PERSON_ID,
  TEST_PERSON_1_ID,
} from 'test/integration/constants/test-person-ids.constants';
import { TEST_COMPANY_1_ID } from 'test/integration/constants/test-company-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';
import { TEST_PRIMARY_LINK_URL } from 'test/integration/constants/test-primary-link-url.constant';

describe('Core REST API Find One endpoint', () => {
  let personCity: string;

  beforeAll(async () => {
    await deleteAllRecords('person');
    await deleteAllRecords('company');

    personCity = generateRecordName(TEST_PERSON_1_ID);

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

    await makeRestAPIRequest({
      method: 'post',
      path: '/people',
      body: {
        id: TEST_PERSON_1_ID,
        city: personCity,
        companyId: TEST_COMPANY_1_ID,
      },
    });
  });

  it('should retrieve a person by ID', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: `/people/${TEST_PERSON_1_ID}`,
    })
      .expect(200)
      .expect((res) => {
        const person = res.body.data.person;

        expect(person).not.toBeNull();
        expect(person.id).toBe(TEST_PERSON_1_ID);
        expect(person.city).toBe(personCity);
      });
  });

  it('should return 400 error when trying to retrieve a non-existing person', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: `/people/${NOT_EXISTING_TEST_PERSON_ID}`,
    })
      .expect(400)
      .expect((res) => {
        expect(res.body.messages[0]).toContain('Record not found');
        expect(res.body.error).toBe('BadRequestException');
      });
  });

  it('should support depth 0 parameter', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: `/people/${TEST_PERSON_1_ID}?depth=0`,
    })
      .expect(200)
      .expect((res) => {
        const person = res.body.data.person;

        expect(person).toBeDefined();
        expect(person.companyId).toBeDefined();
        expect(person.company).not.toBeDefined();
      });
  });

  it('should support depth 1 parameter', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: `/people/${TEST_PERSON_1_ID}?depth=1`,
    })
      .expect(200)
      .expect((res) => {
        const person = res.body.data.person;

        expect(person.company).toBeDefined();
        expect(person.company.domainName.primaryLinkUrl).toBe(
          TEST_PRIMARY_LINK_URL,
        );
        expect(person.company.people).not.toBeDefined();
      });
  });

  it('should support depth 2 parameter', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: `/people/${TEST_PERSON_1_ID}?depth=2`,
    })
      .expect(200)
      .expect((res) => {
        const person = res.body.data.person;

        expect(person.company.people).toBeDefined();

        const depth2Person = person.company.people.find(
          (p) => p.id === person.id,
        );

        expect(depth2Person).toBeDefined();
      });
  });
});
