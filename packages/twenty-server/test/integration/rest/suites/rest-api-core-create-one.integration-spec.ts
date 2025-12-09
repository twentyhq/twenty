import { TEST_COMPANY_1_ID } from 'test/integration/constants/test-company-ids.constants';
import { TEST_PERSON_1_ID } from 'test/integration/constants/test-person-ids.constants';
import {
  TEST_PRIMARY_LINK_URL,
  TEST_PRIMARY_LINK_URL_WIITHOUT_TRAILING_SLASH,
} from 'test/integration/constants/test-primary-link-url.constant';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import { FieldActorSource } from 'twenty-shared/types';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('Core REST API Create One endpoint', () => {
  beforeEach(async () => {
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
    });
  });

  afterAll(async () => {
    await deleteAllRecords('person');
    await deleteAllRecords('company');
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
        expect(createdPerson.createdBy.source).toBe(FieldActorSource.API);
        expect(createdPerson.createdBy.workspaceMemberId).toBe(null);
      });
  });

  it('should create a new person with specific createdBy', async () => {
    const personCity = generateRecordName(TEST_PERSON_1_ID);
    const requestBody = {
      id: TEST_PERSON_1_ID,
      city: personCity,
      companyId: TEST_COMPANY_1_ID,
      createdBy: {
        source: FieldActorSource.EMAIL,
      },
    };

    await makeRestAPIRequest({
      method: 'post',
      path: `/people`,
      body: requestBody,
    })
      .expect(201)
      .expect((res) => {
        const createdPerson = res.body.data.createPerson;

        expect(createdPerson.createdBy.source).toBe(FieldActorSource.EMAIL);
        expect(createdPerson.createdBy.workspaceMemberId).toBe(null);
      });
  });

  it('should create a new person with MANUAL createdBy if user identified', async () => {
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
      bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    })
      .expect(201)
      .expect((res) => {
        const createdPerson = res.body.data.createPerson;

        expect(createdPerson.createdBy.source).toBe(FieldActorSource.MANUAL);
        expect(createdPerson.createdBy.workspaceMemberId).toBe(
          WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        );
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
          TEST_PRIMARY_LINK_URL_WIITHOUT_TRAILING_SLASH,
        );
        expect(createdPerson.company.people).not.toBeDefined();
      });
  });

  it('should not support depth 2 parameter', async () => {
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
    }).expect(400);
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
        expect(res.body.messages[0]).toContain(
          `A duplicate entry was detected`,
        );
        expect(res.body.error).toBe('BadRequestException');
      });
  });

  it('should return a BadRequestException when trying to create an opportunity with an invalid enum', async () => {
    const requestBody = {
      stage: 'INVALID_ENUM_VALUE',
    };

    await makeRestAPIRequest({
      method: 'post',
      path: `/opportunities`,
      body: requestBody,
    })
      .expect(400)
      .expect((res) => {
        expect(res.body.messages[0]).toMatch(
          'Invalid value \'INVALID_ENUM_VALUE\' for field "stage"',
        );
        expect(res.body.error).toBe('BadRequestException');
      });
  });
});
