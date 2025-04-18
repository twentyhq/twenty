import {
  NOT_EXISTING_PERSON_ID,
  PERSON_1_ID,
} from 'test/integration/constants/mock-person-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

describe('Core REST API Update One endpoint', () => {
  beforeAll(async () => {
    await makeRestAPIRequest({
      method: 'delete',
      path: `/people/${PERSON_1_ID}`,
    });
    await makeRestAPIRequest({
      method: 'post',
      path: `/people`,
      body: {
        id: PERSON_1_ID,
      },
    });
  });

  it('should update an existing person (name, emails, and city)', async () => {
    const updatedData = {
      name: {
        firstName: 'Updated',
        lastName: 'Person',
      },
      emails: {
        primaryEmail: 'updated@example.com',
        additionalEmails: ['extra@example.com'],
      },
      city: generateRecordName(PERSON_1_ID),
    };

    await makeRestAPIRequest({
      method: 'patch',
      path: `/people/${PERSON_1_ID}`,
      body: updatedData,
    })
      .expect(200)
      .expect((res) => {
        const updatedPerson = res.body.data.updatePerson;

        expect(updatedPerson.id).toBe(PERSON_1_ID);
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
        expect(updatedPerson.companyId).toBe(null);
      });
  });

  it('should return a EntityNotFoundError when trying to update a non-existing person', async () => {
    await makeRestAPIRequest({
      method: 'patch',
      path: `/people/${NOT_EXISTING_PERSON_ID}`,
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
