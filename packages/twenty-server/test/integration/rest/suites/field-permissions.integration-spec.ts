import gql from 'graphql-tag';
import { TEST_PERSON_1_ID } from 'test/integration/constants/test-person-ids.constants';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';
import { upsertFieldPermissions } from 'test/integration/graphql/utils/upsert-field-permissions.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';

describe('Restricted fields', () => {
  let personCity: string;
  let adminRoleId: string;
  let personObjectId: string;
  let emailsFieldId: string;

  beforeAll(async () => {
    personCity = generateRecordName(TEST_PERSON_1_ID);

    await makeRestAPIRequest({
      method: 'post',
      path: '/people',
      body: {
        id: TEST_PERSON_1_ID,
        city: personCity,
        emails: {
          primaryEmail: 'test@test.com',
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

    // Get admin role ID
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

    adminRoleId = rolesResponse.body.data.getRoles.find(
      (role: any) => role.label === 'Member',
    )?.id;

    // Create field permission restricting read access to email field
    await upsertFieldPermissions({
      roleId: adminRoleId,
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

  describe('With Feature flag enabled', () => {
    beforeAll(async () => {
      const enablePermissionsQuery = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        'IS_FIELDS_PERMISSIONS_ENABLED',
        true,
      );

      await makeGraphqlAPIRequest(enablePermissionsQuery);
    });

    afterAll(async () => {
      const disablePermissionsQuery = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        'IS_FIELDS_PERMISSIONS_ENABLED',
        false,
      );

      await makeGraphqlAPIRequest(disablePermissionsQuery);
    });
    it('should hide fields when user has restricted read permissions', async () => {
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
  });

  describe('With feature flag disabled', () => {
    it('should query all fields despite field permission restriction', async () => {
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
          expect(person.emails).toBeDefined();
        });
    });
  });
});
