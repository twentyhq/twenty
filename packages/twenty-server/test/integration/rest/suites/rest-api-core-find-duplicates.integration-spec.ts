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

  it('should retrieve company duplicates by exact name match', async () => {
    const companyId = '2c78e086-7bf9-4735-bf41-66c7f854d3a1';

    await makeRestAPIRequest({
      method: 'post',
      path: '/companies',
      body: {
        id: companyId,
        name: 'Acme Holdings',
        domainName: {
          primaryLinkUrl: 'https://acme-holdings.example',
        },
      },
    }).expect(201);

    const response = await makeRestAPIRequest({
      method: 'post',
      path: '/companies/duplicates',
      body: {
        data: [
          {
            name: 'Acme Holdings',
            domainName: {
              primaryLinkUrl: 'https://another-domain.example',
            },
          },
        ],
      },
    }).expect(200);

    const [duplicatesInfo] = response.body.data;

    expect(duplicatesInfo.totalCount).toBe(1);
    expect(duplicatesInfo.companyDuplicates).toHaveLength(1);
    expect(duplicatesInfo.companyDuplicates[0].id).toBe(companyId);
    expect(duplicatesInfo.companyDuplicates[0].name).toBe('Acme Holdings');
  });

  it('should retrieve company duplicates by fuzzy name match', async () => {
    const companyId = '5eb60119-b822-46a5-9920-ae1454997c56';

    await makeRestAPIRequest({
      method: 'post',
      path: '/companies',
      body: {
        id: companyId,
        name: 'Acme Corporation',
        domainName: {
          primaryLinkUrl: 'https://acme-corporation.example',
        },
      },
    }).expect(201);

    const response = await makeRestAPIRequest({
      method: 'post',
      path: '/companies/duplicates',
      body: {
        data: [
          {
            name: 'Acme Corporaton',
            domainName: {
              primaryLinkUrl: 'https://another-acme.example',
            },
          },
        ],
      },
    }).expect(200);

    const [duplicatesInfo] = response.body.data;

    expect(duplicatesInfo.totalCount).toBe(1);
    expect(duplicatesInfo.companyDuplicates).toHaveLength(1);
    expect(duplicatesInfo.companyDuplicates[0].id).toBe(companyId);
    expect(duplicatesInfo.companyDuplicates[0].name).toBe('Acme Corporation');
  });

  it('should retrieve company duplicates by exact domain match', async () => {
    const companyId = 'd9e9b3f4-c884-4fef-8a61-4c1ee0c78eb1';

    await makeRestAPIRequest({
      method: 'post',
      path: '/companies',
      body: {
        id: companyId,
        name: 'Domain Match Source',
        domainName: {
          primaryLinkUrl: 'https://shared-domain.example',
        },
      },
    }).expect(201);

    const response = await makeRestAPIRequest({
      method: 'post',
      path: '/companies/duplicates',
      body: {
        data: [
          {
            name: 'Different Name',
            domainName: {
              primaryLinkUrl: 'https://shared-domain.example',
            },
          },
        ],
      },
    }).expect(200);

    const [duplicatesInfo] = response.body.data;

    expect(duplicatesInfo.totalCount).toBe(1);
    expect(duplicatesInfo.companyDuplicates).toHaveLength(1);
    expect(duplicatesInfo.companyDuplicates[0].id).toBe(companyId);
    expect(duplicatesInfo.companyDuplicates[0].domainName.primaryLinkUrl).toBe(
      'https://shared-domain.example',
    );
  });

  it('should not retrieve company duplicates for distinct fuzzy names', async () => {
    const companyId = '74ae30ef-6073-44a4-97a6-4d2802f4b17c';

    await makeRestAPIRequest({
      method: 'post',
      path: '/companies',
      body: {
        id: companyId,
        name: 'Acme Corp',
        domainName: {
          primaryLinkUrl: 'https://distinct-acme.example',
        },
      },
    }).expect(201);

    const response = await makeRestAPIRequest({
      method: 'post',
      path: '/companies/duplicates',
      body: {
        data: [
          {
            name: 'Totally Different Inc',
            domainName: {
              primaryLinkUrl: 'https://totally-different.example',
            },
          },
        ],
      },
    }).expect(200);

    const [duplicatesInfo] = response.body.data;

    expect(duplicatesInfo.totalCount).toBe(0);
    expect(duplicatesInfo.companyDuplicates).toHaveLength(0);
  });

  it('should return a company duplicate only once when both exact name and domain match', async () => {
    const companyId = '534a17fd-b3e0-454d-a04f-31cabf336a79';

    await makeRestAPIRequest({
      method: 'post',
      path: '/companies',
      body: {
        id: companyId,
        name: 'Dual Match Company',
        domainName: {
          primaryLinkUrl: 'https://dual-match.example',
        },
      },
    }).expect(201);

    const response = await makeRestAPIRequest({
      method: 'post',
      path: '/companies/duplicates',
      body: {
        data: [
          {
            name: 'Dual Match Company',
            domainName: {
              primaryLinkUrl: 'https://dual-match.example',
            },
          },
        ],
      },
    }).expect(200);

    const [duplicatesInfo] = response.body.data;

    expect(duplicatesInfo.totalCount).toBe(1);
    expect(duplicatesInfo.companyDuplicates).toHaveLength(1);
    expect(duplicatesInfo.companyDuplicates[0].id).toBe(companyId);
  });

  it('should retrieve fuzzy company duplicates within the bounded response time budget', async () => {
    const companies = Array.from({ length: 1000 }, (_, index) => ({
      id: `00000000-0000-4000-8000-${(index + 1).toString().padStart(12, '0')}`,
      name: index === 777 ? 'Acme Corporation' : `Benchmark Company ${index}`,
      domainName: {
        primaryLinkUrl:
          index === 777
            ? 'https://benchmark-acme.example'
            : `https://benchmark-${index}.example`,
      },
    }));

    await makeRestAPIRequest({
      method: 'post',
      path: '/batch/companies',
      body: companies,
    }).expect(201);

    const startedAt = process.hrtime.bigint();
    const response = await makeRestAPIRequest({
      method: 'post',
      path: '/companies/duplicates',
      body: {
        data: [
          {
            name: 'Acme Corporaton',
          },
        ],
      },
    }).expect(200);
    const elapsedInMilliseconds =
      Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    const [duplicatesInfo] = response.body.data;

    expect(duplicatesInfo.totalCount).toBe(1);
    expect(duplicatesInfo.companyDuplicates).toHaveLength(1);
    expect(duplicatesInfo.companyDuplicates[0].name).toBe('Acme Corporation');
    expect(elapsedInMilliseconds).toBeLessThan(500);
  });
});
