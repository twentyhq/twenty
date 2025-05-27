import {
  NOT_EXISTING_TEST_PERSON_ID,
  TEST_PERSON_1_ID,
} from 'test/integration/constants/test-person-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import { TEST_COMPANY_1_ID } from 'test/integration/constants/test-company-ids.constants';
import { TEST_PRIMARY_LINK_URL } from 'test/integration/constants/test-primary-link-url.constant';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

describe('Core REST API Update One endpoint', () => {
  const updatedData = {
    name: {
      firstName: 'Updated',
      lastName: 'Person',
    },
    emails: {
      primaryEmail: 'updated@example.com',
      additionalEmails: ['extra@example.com'],
    },
    city: generateRecordName(TEST_PERSON_1_ID),
  };

  beforeAll(async () => {
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
    await makeRestAPIRequest({
      method: 'post',
      path: `/people`,
      body: {
        id: TEST_PERSON_1_ID,
        companyId: TEST_COMPANY_1_ID,
      },
    });
  });

  it('should update an existing person (name, emails, and city)', async () => {
    await makeRestAPIRequest({
      method: 'patch',
      path: `/people/${TEST_PERSON_1_ID}`,
      body: updatedData,
    })
      .expect(200)
      .expect((res) => {
        const updatedPerson = res.body.data.updatePerson;

        expect(updatedPerson.id).toBe(TEST_PERSON_1_ID);
        expect(updatedPerson.name.firstName).toBe(updatedData.name.firstName);
        expect(updatedPerson.name.lastName).toBe(updatedData.name.lastName);
        expect(updatedPerson.emails.primaryEmail).toBe(
          updatedData.emails.primaryEmail,
        );
        expect(updatedPerson.emails.additionalEmails).toEqual(
          updatedData.emails.additionalEmails,
        );
        expect(updatedPerson.city).toBe(updatedData.city);

        expect(updatedPerson.jobTitle).toBe('');
        expect(updatedPerson.companyId).toBe(TEST_COMPANY_1_ID);
      });
  });

  it('should support depth 0 parameter', async () => {
    await makeRestAPIRequest({
      method: 'patch',
      path: `/people/${TEST_PERSON_1_ID}?depth=0`,
      body: updatedData,
    })
      .expect(200)
      .expect((res) => {
        const updatedPerson = res.body.data.updatePerson;

        expect(updatedPerson.companyId).toBeDefined();
        expect(updatedPerson.company).not.toBeDefined();
      });
  });

  it('should support depth 1 parameter', async () => {
    await makeRestAPIRequest({
      method: 'patch',
      path: `/people/${TEST_PERSON_1_ID}?depth=1`,
      body: updatedData,
    })
      .expect(200)
      .expect((res) => {
        const updatedPerson = res.body.data.updatePerson;

        expect(updatedPerson.company).toBeDefined();
        expect(updatedPerson.company.domainName.primaryLinkUrl).toBe(
          TEST_PRIMARY_LINK_URL,
        );
        expect(updatedPerson.company.people).not.toBeDefined();
      });
  });

  it('should support depth 2 parameter', async () => {
    await makeRestAPIRequest({
      method: 'patch',
      path: `/people/${TEST_PERSON_1_ID}?depth=2`,
      body: updatedData,
    })
      .expect(200)
      .expect((res) => {
        const updatedPerson = res.body.data.updatePerson;

        expect(updatedPerson.company.people).toBeDefined();

        const depth2Person = updatedPerson.company.people.find(
          // @ts-expect-error legacy noImplicitAny
          (p) => p.id === updatedPerson.id,
        );

        expect(depth2Person).toBeDefined();
      });
  });

  it('should return a EntityNotFoundError when trying to update a non-existing person', async () => {
    await makeRestAPIRequest({
      method: 'patch',
      path: `/people/${NOT_EXISTING_TEST_PERSON_ID}`,
    })
      .expect(400)
      .expect((res) => {
        expect(res.body.messages[0]).toContain(
          `Could not find any entity of type "person"`,
        );
        expect(res.body.error).toBe('EntityNotFoundError');
      });
  });
});
