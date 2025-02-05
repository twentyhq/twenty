import { INITIAL_PERSON_DATA } from 'test/integration/constants/initial-person-data.constants';
import {
  FAKE_PERSON_ID,
  PERSON_2_ID,
} from 'test/integration/constants/mock-person-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

describe('Core REST API Update One endpoint', () => {
  let initialPersonData;

  beforeAll(async () => {
    initialPersonData = INITIAL_PERSON_DATA;

    await makeRestAPIRequest({
      method: 'post',
      path: `/people`,
      body: initialPersonData,
    }).expect(200);
  });

  afterAll(async () => {
    await makeRestAPIRequest({
      method: 'delete',
      path: `/people/${PERSON_2_ID}`,
    }).expect(200);
  });

  it('3.a. should update an existing person (name, emails, and city)', async () => {
    const updatedData = {
      name: {
        firstName: 'Updated',
        lastName: 'Person',
      },
      emails: {
        primaryEmail: 'updated@example.com',
        additionalEmails: ['extra@example.com'],
      },
      city: generateRecordName(PERSON_2_ID),
    };

    const response = await makeRestAPIRequest({
      method: 'patch',
      path: `/people/${PERSON_2_ID}`,
      body: updatedData,
    }).expect(200);

    const updatedPerson = response.body.data.updatePerson;

    expect(updatedPerson.id).toBe(PERSON_2_ID);
    expect(updatedPerson.name.firstName).toBe(updatedData.name.firstName);
    expect(updatedPerson.name.lastName).toBe(updatedData.name.lastName);
    expect(updatedPerson.emails.primaryEmail).toBe(
      updatedData.emails.primaryEmail,
    );
    expect(updatedPerson.emails.additionalEmails).toEqual(
      updatedData.emails.additionalEmails,
    );
    expect(updatedPerson.city).toBe(updatedData.city);

    expect(updatedPerson.jobTitle).toBe(initialPersonData.jobTitle);
    expect(updatedPerson.companyId).toBe(initialPersonData.companyId);
  });

  it('3.b. should return a BadRequestException when trying to update a non-existing person', async () => {
    await makeRestAPIRequest({
      method: 'patch',
      path: `/people/${FAKE_PERSON_ID}`,
      body: { city: 'NonExistingCity' },
    })
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe('BadRequestException');
        expect(res.body.messages[0]).toContain('Record ID not found');
      });
  });

  it('3.c. should return an UnauthorizedException when an invalid token is provided', async () => {
    await makeRestAPIRequest({
      method: 'patch',
      path: `/people/${PERSON_2_ID}`,
      headers: { authorization: 'Bearer invalid-token' },
      body: { city: 'InvalidTokenCity' },
    })
      .expect(401)
      .expect((res) => {
        expect(res.body.error).toBe('UNAUTHENTICATED');
      });
  });
});
