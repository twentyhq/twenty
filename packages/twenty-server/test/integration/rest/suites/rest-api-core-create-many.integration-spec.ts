import {
  TEST_PERSON_1_ID,
  TEST_PERSON_2_ID,
} from 'test/integration/constants/test-person-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';
import { TEST_COMPANY_1_ID } from 'test/integration/constants/test-company-ids.constants';
import { TEST_PRIMARY_LINK_URL } from 'test/integration/constants/test-primary-link-url.constant';
import { TIM_ACCOUNT_ID } from 'test/integration/graphql/integration.constants';

import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';

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
      bearer: ADMIN_ACCESS_TOKEN,
    })
      .expect(201)
      .expect((res) => {
        const createdPeople = res.body.data.createPeople;

        expect(createdPeople.length).toBe(2);

        expect(createdPeople[0].createdBy.source).toBe(FieldActorSource.MANUAL);
        expect(createdPeople[0].createdBy.workspaceMemberId).toBe(
          TIM_ACCOUNT_ID,
        );

        expect(createdPeople[1].createdBy.source).toBe(FieldActorSource.MANUAL);
        expect(createdPeople[1].createdBy.workspaceMemberId).toBe(
          TIM_ACCOUNT_ID,
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
        const [createdPerson1, createdPerson2] = res.body.data.createPeople;

        expect(createdPerson1.company.people).toBeDefined();
        expect(createdPerson2.company.people).toBeDefined();

        const depth2Person1 = createdPerson1.company.people.find(
          // @ts-expect-error legacy noImplicitAny
          (p) => p.id === createdPerson1.id,
        );
        const depth2Person2 = createdPerson2.company.people.find(
          // @ts-expect-error legacy noImplicitAny
          (p) => p.id === createdPerson2.id,
        );

        expect(depth2Person1).toBeDefined();
        expect(depth2Person2).toBeDefined();
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
