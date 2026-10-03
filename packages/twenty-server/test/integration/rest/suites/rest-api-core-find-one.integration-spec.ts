import { TEST_COMPANY_1_ID } from 'test/integration/constants/test-company-ids.constants';
import {
  NOT_EXISTING_TEST_PERSON_ID,
  TEST_PERSON_1_ID,
} from 'test/integration/constants/test-person-ids.constants';
import {
  TEST_PRIMARY_LINK_URL,
  TEST_PRIMARY_LINK_URL_AS_DOMAIN,
} from 'test/integration/constants/test-primary-link-url.constant';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

describe('Core REST API Find One endpoint', () => {
  let personJobTitle: string;
  let opportunityId: string;

  beforeAll(async () => {
    await deleteAllRecords('opportunity');
    await deleteAllRecords('person');
    await deleteAllRecords('company');

    personJobTitle = generateRecordName(TEST_PERSON_1_ID);

    await makeRestApiRequest({
      method: 'post',
      path: '/companies',
      body: {
        id: TEST_COMPANY_1_ID,
        domainName: {
          primaryLinkUrl: TEST_PRIMARY_LINK_URL,
        },
      },
    });

    await makeRestApiRequest({
      method: 'post',
      path: '/people',
      body: {
        id: TEST_PERSON_1_ID,
        jobTitle: personJobTitle,
        companyId: TEST_COMPANY_1_ID,
      },
    });

    const opportunityResponse = await makeRestApiRequest({
      method: 'post',
      path: '/opportunities',
      body: {
        name: generateRecordName(TEST_PERSON_1_ID),
        pointOfContactId: TEST_PERSON_1_ID,
      },
    });

    opportunityId = opportunityResponse.body.data.createOpportunity.id;
  });

  afterAll(async () => {
    await deleteAllRecords('opportunity');
  });

  it('should retrieve a person by ID', async () => {
    await makeRestApiRequest({
      method: 'get',
      path: `/people/${TEST_PERSON_1_ID}`,
    })
      .expect(200)
      .expect((res) => {
        const person = res.body.data.person;

        expect(person).not.toBeNull();
        expect(person.id).toBe(TEST_PERSON_1_ID);
        expect(person.jobTitle).toBe(personJobTitle);
      });
  });

  it('should return 404 error when trying to retrieve a non-existing person', async () => {
    const response = await makeRestApiRequest({
      method: 'get',
      path: `/people/${NOT_EXISTING_TEST_PERSON_ID}`,
    });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('NotFoundException');
    expect(response.body.messages[0]).toBe('Record not found');
  });

  it('should return 400 error when trying to retrieve with malformed uuid', async () => {
    await makeRestApiRequest({
      method: 'get',
      path: `/people/malformed-uuid`,
    })
      .expect(400)
      .expect((res) => {
        expect(res.body.messages[0]).toContain(
          "'malformed-uuid' is not a valid UUID",
        );
        expect(res.body.error).toBe('BadRequestException');
      });
  });

  it('should support depth 0 parameter', async () => {
    await makeRestApiRequest({
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
    await makeRestApiRequest({
      method: 'get',
      path: `/people/${TEST_PERSON_1_ID}?depth=1`,
    })
      .expect(200)
      .expect((res) => {
        const person = res.body.data.person;

        expect(person.company).toBeDefined();
        expect(person.company.domainName.primaryLinkUrl).toBe(
          TEST_PRIMARY_LINK_URL_AS_DOMAIN,
        );
        expect(person.company.people).not.toBeDefined();
      });
  });

  it('should not support depth 2 parameter', async () => {
    await makeRestApiRequest({
      method: 'get',
      path: `/people/${TEST_PERSON_1_ID}?depth=2`,
    }).expect(400);
  });

  describe('fields parameter', () => {
    it('should only return the requested fields and id', async () => {
      await makeRestApiRequest({
        method: 'get',
        path: `/people/${TEST_PERSON_1_ID}?fields=jobTitle,emails`,
      })
        .expect(200)
        .expect((res) => {
          const person = res.body.data.person;

          expect(Object.keys(person).sort()).toEqual(
            ['emails', 'id', 'jobTitle'].sort(),
          );
          expect(person.id).toBe(TEST_PERSON_1_ID);
          expect(person.jobTitle).toBe(personJobTitle);
          expect(person.emails).toHaveProperty('primaryEmail');
          expect(res.headers['x-twenty-fields-capped']).toBeUndefined();
        });
    });

    it('should return the join column of a requested relation at depth 0', async () => {
      await makeRestApiRequest({
        method: 'get',
        path: `/people/${TEST_PERSON_1_ID}?fields=company&depth=0`,
      })
        .expect(200)
        .expect((res) => {
          const person = res.body.data.person;

          expect(person.companyId).toBe(TEST_COMPANY_1_ID);
          expect(person.company).toBeUndefined();
          expect(person.jobTitle).toBeUndefined();
        });
    });

    it('should only expand requested relations at depth 1', async () => {
      await makeRestApiRequest({
        method: 'get',
        path: `/people/${TEST_PERSON_1_ID}?fields=jobTitle,company&depth=1`,
      })
        .expect(200)
        .expect((res) => {
          const person = res.body.data.person;

          expect(person.company.id).toBe(TEST_COMPANY_1_ID);
          expect(person.pointOfContactForOpportunities).toBeUndefined();
        });

      await makeRestApiRequest({
        method: 'get',
        path: `/people/${TEST_PERSON_1_ID}?fields=jobTitle,company,pointOfContactForOpportunities&depth=1`,
      })
        .expect(200)
        .expect((res) => {
          const person = res.body.data.person;

          expect(person.company.id).toBe(TEST_COMPANY_1_ID);
          expect(
            person.pointOfContactForOpportunities.map(
              (opportunity: { id: string }) => opportunity.id,
            ),
          ).toEqual([opportunityId]);
        });
    });

    it('should return 400 on one-to-many relation fields at depth 0', async () => {
      await makeRestApiRequest({
        method: 'get',
        path: `/people/${TEST_PERSON_1_ID}?fields=jobTitle,pointOfContactForOpportunities&depth=0`,
      })
        .expect(400)
        .expect((res) => {
          expect(res.body.messages[0]).toContain(
            'pointOfContactForOpportunities',
          );
        });
    });

    it('should return 400 on unknown fields', async () => {
      await makeRestApiRequest({
        method: 'get',
        path: `/people/${TEST_PERSON_1_ID}?fields=jobTitle,unknownField`,
      })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toBe('BadRequestException');
          expect(res.body.messages[0]).toContain('unknownField');
        });
    });
  });
});
