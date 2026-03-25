import gql from 'graphql-tag';
import { TEST_COMPANY_1_ID } from 'test/integration/constants/test-company-ids.constants';
import { TEST_PERSON_1_ID } from 'test/integration/constants/test-person-ids.constants';
import { TEST_PRIMARY_LINK_URL } from 'test/integration/constants/test-primary-link-url.constant';
import { upsertFieldPermissions } from 'test/integration/graphql/utils/upsert-field-permissions.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

describe('Restricted fields', () => {
  let personCity: string;
  let memberRoleId: string;
  let personObjectId: string;
  let emailsFieldId: string;
  let phonesFieldId: string;

  beforeAll(async () => {
    personCity = generateRecordName(TEST_PERSON_1_ID);

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
      path: '/people',
      body: {
        id: TEST_PERSON_1_ID,
        city: personCity,
        emails: {
          primaryEmail: 'test@test.com',
        },
        phones: {
          primaryPhoneNumber: '123456789',
          primaryPhoneCountryCode: 'US',
          primaryPhoneCallingCode: '+1',
        },
      },
    });

    // Get object metadata IDs for Person and Company
    const getObjectMetadataOperation = {
      query: gql`
        query {
          objects(paging: { first: 1000 }) {
            edges {
              node {
                id
                nameSingular
              }
            }
          }
        }
      `,
    };

    const objectMetadataResponse = await makeMetadataAPIRequest(
      getObjectMetadataOperation,
    );
    const objects = objectMetadataResponse.body.data.objects.edges;

    personObjectId = objects.find(
      (obj: any) => obj.node.nameSingular === 'person',
    )?.node.id;

    // Get field metadata ID for email field
    const getFieldMetadataOperation = {
      query: gql`
        query {
          fields(paging: { first: 1000 }) {
            edges {
              node {
                id
                name
                object {
                  nameSingular
                }
              }
            }
          }
        }
      `,
    };

    const fieldMetadataResponse = await makeMetadataAPIRequest(
      getFieldMetadataOperation,
    );
    const fields = fieldMetadataResponse.body.data.fields.edges;

    emailsFieldId = fields.find(
      (field: any) =>
        field.node.name === 'emails' &&
        field.node.object.nameSingular === 'person',
    ).node.id;

    phonesFieldId = fields.find(
      (field: any) =>
        field.node.name === 'phones' &&
        field.node.object.nameSingular === 'person',
    ).node.id;

    // Get member role ID
    const getRolesOperation = {
      query: gql`
        query {
          getRoles {
            id
            label
          }
        }
      `,
    };

    const rolesResponse = await makeMetadataAPIRequest(getRolesOperation);

    memberRoleId = rolesResponse.body.data.getRoles.find(
      (role: any) => role.label === 'Member',
    )?.id;

    // Create field permission restricting read access to email field
    await upsertFieldPermissions({
      roleId: memberRoleId,
      fieldPermissions: [
        {
          objectMetadataId: personObjectId,
          fieldMetadataId: emailsFieldId,
          canReadFieldValue: false,
          canUpdateFieldValue: null,
        },
      ],
    });
  });

  it('should hide fields when user has restricted read permissions - findOne', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: `/people/${TEST_PERSON_1_ID}`,
      bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    })
      .expect(200)
      .expect((res) => {
        const person = res.body.data.person;

        expect(person).toBeDefined();
        expect(person.id).toBeDefined();
        expect(person.emails).toBeUndefined();
      });
  });

  describe('updateOne', () => {
    it('should hide fields in the response when user has restricted read permissions', async () => {
      // Create field permission restricting update access to phones field
      await upsertFieldPermissions({
        roleId: memberRoleId,
        fieldPermissions: [
          {
            objectMetadataId: personObjectId,
            fieldMetadataId: phonesFieldId,
            canReadFieldValue: false,
            canUpdateFieldValue: null,
          },
        ],
      });

      await makeRestAPIRequest({
        method: 'patch',
        path: `/people/${TEST_PERSON_1_ID}`,
        bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        body: {
          name: {
            firstName: 'John',
          },
        },
      })
        .expect(200)
        .expect((res) => {
          const updatedPerson = res.body.data.updatePerson;

          expect(updatedPerson.name.firstName).toBe('John');
          expect(updatedPerson.phones).toBeUndefined();
        });
    });
    it('should block update when user tries to update non-updatable field', async () => {
      // Create field permission restricting update access to phones field
      await upsertFieldPermissions({
        roleId: memberRoleId,
        fieldPermissions: [
          {
            objectMetadataId: personObjectId,
            fieldMetadataId: phonesFieldId,
            canReadFieldValue: null,
            canUpdateFieldValue: false,
          },
        ],
      });

      await makeRestAPIRequest({
        method: 'patch',
        path: `/people/${TEST_PERSON_1_ID}`,
        bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        body: {
          phones: {
            primaryPhoneNumber: '987654321',
            primaryPhoneCountryCode: 'FR',
            primaryPhoneCallingCode: '+33',
          },
        },
      })
        .expect(400)
        .expect((res) => {
          expect(res.body.messages[0]).toContain(
            'Entity performing the request does not have permission',
          );
        });
    });

    it('should allow update when user has no restricted update permissions', async () => {
      // Remove field permission restrictions
      await upsertFieldPermissions({
        roleId: memberRoleId,
        fieldPermissions: [
          {
            objectMetadataId: personObjectId,
            fieldMetadataId: phonesFieldId,
            canReadFieldValue: null,
            canUpdateFieldValue: null,
          },
        ],
      });

      await makeRestAPIRequest({
        method: 'patch',
        path: `/people/${TEST_PERSON_1_ID}`,
        bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        body: {
          city: 'Updated City',
        },
      })
        .expect(200)
        .expect((res) => {
          const updatedPerson = res.body.data.updatePerson;

          expect(updatedPerson.city).toBe('Updated City');
        });
    });
  });

  describe('createOne', () => {
    it('should block create when user has restricted update permissions on phones field', async () => {
      // Create field permission restricting update access to phones field
      await upsertFieldPermissions({
        roleId: memberRoleId,
        fieldPermissions: [
          {
            objectMetadataId: personObjectId,
            fieldMetadataId: phonesFieldId,
            canReadFieldValue: null,
            canUpdateFieldValue: false,
          },
        ],
      });

      await makeRestAPIRequest({
        method: 'post',
        path: `/people`,
        bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        body: {
          phones: {
            primaryPhoneNumber: '555123456',
            primaryPhoneCountryCode: 'US',
            primaryPhoneCallingCode: '+1',
          },
        },
      })
        .expect(400)
        .expect((res) => {
          expect(res.body.messages[0]).toContain(
            'Entity performing the request does not have permission',
          );
        });
    });

    it('should allow create when user has no restricted update permissions', async () => {
      // Remove field permission restrictions on phones
      await upsertFieldPermissions({
        roleId: memberRoleId,
        fieldPermissions: [
          {
            objectMetadataId: personObjectId,
            fieldMetadataId: phonesFieldId,
            canReadFieldValue: null,
            canUpdateFieldValue: null,
          },
        ],
      });

      await makeRestAPIRequest({
        method: 'post',
        path: `/people`,
        bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        body: {
          city: 'New City',
        },
      })
        .expect(201)
        .expect((res) => {
          const createdPerson = res.body.data.createPerson;

          expect(createdPerson.city).toBe('New City');
          expect(createdPerson.emails).toBeUndefined(); // No reading rights on emails
        });
    });
  });

  describe('createMany', () => {
    it('should block createMany when user has restricted update permissions on phones field', async () => {
      // Create field permission restricting update access to phones field
      await upsertFieldPermissions({
        roleId: memberRoleId,
        fieldPermissions: [
          {
            objectMetadataId: personObjectId,
            fieldMetadataId: phonesFieldId,
            canReadFieldValue: null,
            canUpdateFieldValue: false,
          },
        ],
      });

      await makeRestAPIRequest({
        method: 'post',
        path: `/batch/people`,
        bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        body: [
          {
            phones: {
              primaryPhoneNumber: '555123456',
              primaryPhoneCountryCode: 'US',
              primaryPhoneCallingCode: '+1',
            },
          },
        ],
      })
        .expect(400)
        .expect((res) => {
          expect(res.body.messages[0]).toContain(
            'Entity performing the request does not have permission',
          );
        });
    });

    it('should allow createMany when user has no restricted update permissions', async () => {
      // Remove field permission restrictions
      await upsertFieldPermissions({
        roleId: memberRoleId,
        fieldPermissions: [
          {
            objectMetadataId: personObjectId,
            fieldMetadataId: phonesFieldId,
            canReadFieldValue: null,
            canUpdateFieldValue: null,
          },
        ],
      });

      await makeRestAPIRequest({
        method: 'post',
        path: `/batch/people`,
        bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        body: [
          {
            city: 'Batch City 1',
          },
          {
            city: 'Batch City 2',
          },
        ],
      })
        .expect(201)
        .expect((res) => {
          const createdPeople = res.body.data.createPeople;

          expect(createdPeople).toHaveLength(2);
          expect(createdPeople[0].city).toBe('Batch City 1');
          expect(createdPeople[0].emails).toBeUndefined(); // No reading rights on emails
          expect(createdPeople[1].city).toBe('Batch City 2');
          expect(createdPeople[1].emails).toBeUndefined(); // No reading rights on emails
        });
    });
  });
});
