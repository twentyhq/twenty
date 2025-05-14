import {
  TEST_PERSON_1_ID,
  TEST_PERSON_2_ID,
} from 'test/integration/constants/test-person-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';
import { TEST_COMPANY_1_ID } from 'test/integration/constants/test-company-ids.constants';
import { TEST_PRIMARY_LINK_URL } from 'test/integration/constants/test-primary-link-url.constant';

describe('Core REST API Create Many endpoint', () => {
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

  it('should create a many person', async () => {
    const requestBody = [
      {
        id: TEST_PERSON_1_ID,
      },
      {
        id: TEST_PERSON_2_ID,
      },
    ];

    await makeRestAPIRequest({
      method: 'post',
      path: `/batch/people`,
      body: requestBody,
    })
      .expect(201)
      .expect((res) => {
        const createdPeople = res.body.data.createPeople;

        expect(createdPeople.length).toBe(2);
        expect(createdPeople[0].id).toBe(TEST_PERSON_1_ID);
        expect(createdPeople[1].id).toBe(TEST_PERSON_2_ID);
      });
  });

  it('should support depth 0 parameter', async () => {
    const requestBody = [
      {
        id: TEST_PERSON_1_ID,
        companyId: TEST_COMPANY_1_ID,
      },
      {
        id: TEST_PERSON_2_ID,
        companyId: TEST_COMPANY_1_ID,
      },
    ];

    await makeRestAPIRequest({
      method: 'post',
      path: `/batch/people?depth=0`,
      body: requestBody,
    })
      .expect(201)
      .expect((res) => {
        const createdPerson = res.body.data.createPeople[0];

        expect(createdPerson.companyId).toBeDefined();
        expect(createdPerson.company).not.toBeDefined();
      });
  });

  it('should support depth 1 parameter', async () => {
    const requestBody = [
      {
        id: TEST_PERSON_1_ID,
        companyId: TEST_COMPANY_1_ID,
      },
      {
        id: TEST_PERSON_2_ID,
        companyId: TEST_COMPANY_1_ID,
      },
    ];

    await makeRestAPIRequest({
      method: 'post',
      path: `/batch/people?depth=1`,
      body: requestBody,
    })
      .expect(201)
      .expect((res) => {
        const createdPerson = res.body.data.createPeople[0];

        expect(createdPerson.company).toBeDefined();
        expect(createdPerson.company.people).not.toBeDefined();
      });
  });

  it('should support depth 2 parameter', async () => {
    const requestBody = [
      {
        id: TEST_PERSON_1_ID,
        companyId: TEST_COMPANY_1_ID,
      },
      {
        id: TEST_PERSON_2_ID,
        companyId: TEST_COMPANY_1_ID,
      },
    ];

    await makeRestAPIRequest({
      method: 'post',
      path: `/batch/people?depth=2`,
      body: requestBody,
    })
      .expect(201)
      .expect((res) => {
        const createdPerson = res.body.data.createPeople[0];

        expect(createdPerson.company.people).toBeDefined();

        const depth2Person = createdPerson.company.people.find(
          (p) => p.id === createdPerson.id,
        );

        expect(depth2Person).toBeDefined();
      });
  });

  it('should return a BadRequestException when trying to create a person with an existing ID', async () => {
    const requestBody = [
      {
        id: TEST_PERSON_1_ID,
      },
      {
        id: TEST_PERSON_2_ID,
      },
    ];

    await makeRestAPIRequest({
      method: 'post',
      path: `/batch/people`,
      body: requestBody,
    });

    await makeRestAPIRequest({
      method: 'post',
      path: `/batch/people`,
      body: requestBody,
    })
      .expect(400)
      .expect((res) => {
        expect(res.body.messages[0]).toContain(`Record already exists`);
        expect(res.body.error).toBe('BadRequestException');
      });
  });
});
