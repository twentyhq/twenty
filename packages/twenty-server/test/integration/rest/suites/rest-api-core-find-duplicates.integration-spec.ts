import { TEST_COMPANY_1_ID } from 'test/integration/constants/test-company-ids.constants';
import {
  TEST_PERSON_1_ID,
  TEST_PERSON_2_ID,
  TEST_PERSON_3_ID,
} from 'test/integration/constants/test-person-ids.constants';
import { TEST_PRIMARY_LINK_URL } from 'test/integration/constants/test-primary-link-url.constant';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

describe('Core REST API Find Duplicates endpoint', () => {
  beforeAll(async () => {
    await deleteAllRecords('person');
    await deleteAllRecords('company');

    await makeRestAPIRequest({
      method: 'post',
      path: '/companies',
      body: {
        id: TEST_COMPANY_1_ID,
        domainName: {
          primaryLinkUrl: TEST_PRIMARY_LINK_URL,
        },
      },
    }).expect(201);

    await makeRestAPIRequest({
      method: 'post',
      path: '/batch/people',
      body: [
        {
          id: TEST_PERSON_1_ID,
          companyId: TEST_COMPANY_1_ID,
          name: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
        {
          id: TEST_PERSON_2_ID,
          companyId: TEST_COMPANY_1_ID,
          name: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
        {
          id: TEST_PERSON_3_ID,
          companyId: TEST_COMPANY_1_ID,
          name: {
            firstName: 'Phil',
            lastName: 'Collins',
          },
        },
      ],
    }).expect(201);
  });

  it('should retrieve duplicates by object data', async () => {
    const response = await makeRestAPIRequest({
      method: 'post',
      path: `/people/duplicates`,
      body: {
        data: [
          {
            name: {
              firstName: 'John',
              lastName: 'Doe',
            },
          },
        ],
      },
    }).expect(200);

    const data = response.body.data;

    expect(data.length).toBe(1);
    const duplicatesInfo = data[0];

    expect(duplicatesInfo.totalCount).toBe(2);
    expect(duplicatesInfo.personDuplicates.length).toBe(2);

    const [personDuplicated1, personDuplicated2] =
      duplicatesInfo.personDuplicates;

    expect(personDuplicated1.id).toBe(TEST_PERSON_1_ID);
    expect(personDuplicated2.id).toBe(TEST_PERSON_2_ID);
  });

  it('should retrieve duplicates by ids', async () => {
    const response = await makeRestAPIRequest({
      method: 'post',
      path: `/people/duplicates`,
      body: {
        ids: [TEST_PERSON_1_ID],
      },
    }).expect(200);

    const data = response.body.data;

    expect(data.length).toBe(1);
    const duplicatesInfo = data[0];

    expect(duplicatesInfo.totalCount).toBe(1);
    expect(duplicatesInfo.personDuplicates.length).toBe(1);

    const [personDuplicated] = duplicatesInfo.personDuplicates;

    expect(personDuplicated.id).toBe(TEST_PERSON_2_ID);
  });

  it('should not provide wrong duplicates', async () => {
    const response = await makeRestAPIRequest({
      method: 'post',
      path: `/people/duplicates`,
      body: {
        data: [
          {
            name: {
              firstName: 'Not',
              lastName: 'Existing',
            },
          },
        ],
      },
    }).expect(200);

    const data = response.body.data;

    expect(data.length).toBe(1);
    const duplicatesInfo = data[0];

    expect(duplicatesInfo.totalCount).toBe(0);
    expect(duplicatesInfo.personDuplicates.length).toBe(0);
  });

  it('should return 400 error when empty object data provided', async () => {
    const response = await makeRestAPIRequest({
      method: 'post',
      path: `/people/duplicates`,
      body: {
        data: [],
      },
    }).expect(400);

    expect(response.body.messages[0]).toContain(
      'The "data" condition can not be empty when "ids" input not provided',
    );
    expect(response.body.error).toBe('BadRequestException');
  });

  it('should return empty result when empty ids provided', async () => {
    const response = await makeRestAPIRequest({
      method: 'post',
      path: `/people/duplicates`,
      body: {
        ids: [],
      },
    }).expect(200);

    expect(response.body.data.length).toBe(0);
  });

  it('should return 400 error when ids and data are provided', async () => {
    const response = await makeRestAPIRequest({
      method: 'post',
      path: `/people/duplicates`,
      body: {
        data: [],
        ids: [],
      },
    }).expect(400);

    expect(response.body.messages[0]).toContain(
      'You cannot provide both "data" and "ids" arguments',
    );
    expect(response.body.error).toBe('BadRequestException');
  });

  it('should support depth 0 parameter', async () => {
    const response = await makeRestAPIRequest({
      method: 'post',
      path: `/people/duplicates?depth=0`,
      body: {
        data: [
          {
            name: {
              firstName: 'John',
              lastName: 'Doe',
            },
          },
        ],
      },
    }).expect(200);

    const data = response.body.data;

    expect(data.length).toBe(1);
    const duplicatesInfo = data[0];

    const [personDuplicated1, personDuplicated2] =
      duplicatesInfo.personDuplicates;

    expect(personDuplicated1.companyId).toBe(TEST_COMPANY_1_ID);
    expect(personDuplicated1.company).not.toBeDefined();
    expect(personDuplicated2.companyId).toBe(TEST_COMPANY_1_ID);
    expect(personDuplicated2.company).not.toBeDefined();
  });

  it('should support depth 1 parameter', async () => {
    const response = await makeRestAPIRequest({
      method: 'post',
      path: `/people/duplicates?depth=1`,
      body: {
        data: [
          {
            name: {
              firstName: 'John',
              lastName: 'Doe',
            },
          },
        ],
      },
    }).expect(200);

    const data = response.body.data;

    expect(data.length).toBe(1);
    const duplicatesInfo = data[0];

    const [personDuplicated1, personDuplicated2] =
      duplicatesInfo.personDuplicates;

    expect(personDuplicated1.company).toBeDefined();
    expect(personDuplicated1.company.id).toBe(TEST_COMPANY_1_ID);
    expect(personDuplicated1.company.people).not.toBeDefined();

    expect(personDuplicated2.company).toBeDefined();
    expect(personDuplicated2.company.id).toBe(TEST_COMPANY_1_ID);
    expect(personDuplicated2.company.people).not.toBeDefined();
  });

  it('should not support depth 2 parameter', async () => {
    await makeRestAPIRequest({
      method: 'post',
      path: `/people/duplicates?depth=2`,
      body: {
        data: [
          {
            name: {
              firstName: 'John',
              lastName: 'Doe',
            },
          },
        ],
      },
    }).expect(400);
  });
});
