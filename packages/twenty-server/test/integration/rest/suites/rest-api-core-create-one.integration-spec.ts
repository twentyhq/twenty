import { TEST_COMPANY_1_ID } from 'test/integration/constants/test-company-ids.constants';
import { TEST_PERSON_1_ID } from 'test/integration/constants/test-person-ids.constants';
import { TEST_PRIMARY_LINK_URL } from 'test/integration/constants/test-primary-link-url.constant';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

describe('Core REST API Create One endpoint', () => {
  beforeEach(async () => {
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
  });

  it('should create a new person', async () => {
    const personCity = generateRecordName(TEST_PERSON_1_ID);
    const requestBody = {
      id: TEST_PERSON_1_ID,
      city: personCity,
      companyId: TEST_COMPANY_1_ID,
    };

    await makeRestAPIRequest({
      method: 'post',
      path: `/people`,
      body: requestBody,
    })
      .expect(201)
      .expect((res) => {
        const createdPerson = res.body.data.createPerson;

        expect(createdPerson.id).toBe(TEST_PERSON_1_ID);
        expect(createdPerson.city).toBe(personCity);
      });
  });

  it('should support depth 0 parameter', async () => {
    const personCity = generateRecordName(TEST_PERSON_1_ID);
    const requestBody = {
      id: TEST_PERSON_1_ID,
      city: personCity,
      companyId: TEST_COMPANY_1_ID,
    };

    await makeRestAPIRequest({
      method: 'post',
      path: `/people?depth=0`,
      body: requestBody,
    })
      .expect(201)
      .expect((res) => {
        const createdPerson = res.body.data.createPerson;

        expect(createdPerson.companyId).toBeDefined();
        expect(createdPerson.company).not.toBeDefined();
      });
  });

  it('should support depth 1 parameter', async () => {
    const personCity = generateRecordName(TEST_PERSON_1_ID);
    const requestBody = {
      id: TEST_PERSON_1_ID,
      city: personCity,
      companyId: TEST_COMPANY_1_ID,
    };

    await makeRestAPIRequest({
      method: 'post',
      path: `/people?depth=1`,
      body: requestBody,
    })
      .expect(201)
      .expect((res) => {
        const createdPerson = res.body.data.createPerson;

        expect(createdPerson.company).toBeDefined();
        expect(createdPerson.company.domainName.primaryLinkUrl).toBe(
          TEST_PRIMARY_LINK_URL,
        );
        expect(createdPerson.company.people).not.toBeDefined();
      });
  });

  it('should support depth 2 parameter', async () => {
    const personCity = generateRecordName(TEST_PERSON_1_ID);
    const requestBody = {
      id: TEST_PERSON_1_ID,
      city: personCity,
      companyId: TEST_COMPANY_1_ID,
    };

    await makeRestAPIRequest({
      method: 'post',
      path: `/people?depth=2`,
      body: requestBody,
    })
      .expect(201)
      .expect((res) => {
        const createdPerson = res.body.data.createPerson;

        expect(createdPerson.company.people).toBeDefined();
        const depth2Person = createdPerson.company.people.find(
          // @ts-expect-error legacy noImplicitAny
          (p) => p.id === createdPerson.id,
        );

        expect(depth2Person).toBeDefined();
      });
  });

  it('should return a BadRequestException when trying to create a person with an existing ID', async () => {
    const personCity = generateRecordName(TEST_PERSON_1_ID);
    const requestBody = {
      id: TEST_PERSON_1_ID,
      city: personCity,
    };

    await makeRestAPIRequest({
      method: 'post',
      path: `/people`,
      body: requestBody,
    });

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
