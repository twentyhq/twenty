import { TEST_COMPANY_1_ID } from 'test/integration/constants/test-company-ids.constants';
import {
  TEST_PERSON_1_ID,
  TEST_PERSON_2_ID,
} from 'test/integration/constants/test-person-ids.constants';
import { TEST_PRIMARY_LINK_URL } from 'test/integration/constants/test-primary-link-url.constant';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';
import { FieldActorSource } from 'twenty-shared/types';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

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

  it('should create many person', async () => {
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
        expect(createdPeople[0].createdBy.source).toBe(FieldActorSource.API);
        expect(createdPeople[0].createdBy.workspaceMemberId).toBe(null);

        expect(createdPeople[1].id).toBe(TEST_PERSON_2_ID);
        expect(createdPeople[1].createdBy.source).toBe(FieldActorSource.API);
        expect(createdPeople[1].createdBy.workspaceMemberId).toBe(null);
      });
  });

  it('should create a new person with specific createdBy', async () => {
    const requestBody = [
      {
        id: TEST_PERSON_1_ID,
        createdBy: {
          source: FieldActorSource.EMAIL,
        },
      },
      {
        id: TEST_PERSON_2_ID,
        createdBy: {
          source: FieldActorSource.MANUAL,
        },
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

        expect(createdPeople[0].createdBy.source).toBe(FieldActorSource.EMAIL);
        expect(createdPeople[0].createdBy.workspaceMemberId).toBe(null);

        expect(createdPeople[1].createdBy.source).toBe(FieldActorSource.MANUAL);
        expect(createdPeople[1].createdBy.workspaceMemberId).toBe(null);
      });
  });

  it('should create many person with MANUAL createdBy if user identified', async () => {
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
      bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    })
      .expect(201)
      .expect((res) => {
        const createdPeople = res.body.data.createPeople;

        expect(createdPeople.length).toBe(2);

        expect(createdPeople[0].createdBy.source).toBe(FieldActorSource.MANUAL);
        expect(createdPeople[0].createdBy.workspaceMemberId).toBe(
          WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        );

        expect(createdPeople[1].createdBy.source).toBe(FieldActorSource.MANUAL);
        expect(createdPeople[1].createdBy.workspaceMemberId).toBe(
          WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        );
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
        const [createdPerson1, createdPerson2] = res.body.data.createPeople;

        expect(createdPerson1.companyId).toBeDefined();
        expect(createdPerson1.company).not.toBeDefined();
        expect(createdPerson2.companyId).toBeDefined();
        expect(createdPerson2.company).not.toBeDefined();
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
        const [createdPerson1, createdPerson2] = res.body.data.createPeople;

        expect(createdPerson1.company).toBeDefined();
        expect(createdPerson1.company.people).not.toBeDefined();
        expect(createdPerson2.company).toBeDefined();
        expect(createdPerson2.company.people).not.toBeDefined();
      });
  });

  it('should not support depth 2 parameter', async () => {
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
    }).expect(400);
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
        expect(res.body.messages[0]).toContain(
          `A duplicate entry was detected`,
        );
        expect(res.body.error).toBe('BadRequestException');
      });
  });
});
