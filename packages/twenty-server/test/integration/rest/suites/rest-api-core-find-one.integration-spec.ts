import {
  NOT_EXISTING_PERSON_ID,
  PERSON_1_ID,
} from 'test/integration/constants/mock-person-ids.constants';
import { COMPANY_1_ID } from 'test/integration/constants/mock-company-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

const testPrimaryLinkUrl = 'http://test';

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
      path: '/companies',
      body: {
        id: COMPANY_1_ID,
        domainName: {
          primaryLinkUrl: testPrimaryLinkUrl,
        },
      },
    });

    await makeRestAPIRequest({
      method: 'post',
      path: '/people',
      body: {
        id: PERSON_1_ID,
        city: personCity,
        companyId: COMPANY_1_ID,
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
      .expect(400)
      .expect((res) => {
        expect(res.body.messages[0]).toContain('Record not found');
        expect(res.body.error).toBe('BadRequestException');
      });
  });

  it('should support depth 0 parameter', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: `/people/${PERSON_1_ID}?depth=0`,
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
      path: `/people/${PERSON_1_ID}?depth=1`,
    })
      .expect(200)
      .expect((res) => {
        const person = res.body.data.person;

        expect(person.company).toBeDefined();
        expect(person.company.domainName.primaryLinkUrl).toBe(
          testPrimaryLinkUrl,
        );
        expect(person.company.people).not.toBeDefined();
      });
  });

  it('should support depth 2 parameter', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: `/people/${PERSON_1_ID}?depth=2`,
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
