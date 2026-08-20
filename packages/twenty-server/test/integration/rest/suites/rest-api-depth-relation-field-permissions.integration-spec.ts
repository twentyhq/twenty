import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import request from 'supertest';
import { createCustomRoleWithObjectPermissions } from 'test/integration/graphql/utils/create-custom-role-with-object-permissions.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateWorkspaceMemberRole } from 'test/integration/graphql/utils/update-workspace-member-role.util';
import { upsertFieldPermissions } from 'test/integration/graphql/utils/upsert-field-permissions.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

describe('REST depth=1 with a restricted relation field', () => {
  let companyId: string;
  let personId: string;
  let customRoleId: string;
  let companyObjectId: string;
  let peopleFieldId: string;
  let originalMemberRoleId: string;

  beforeAll(async () => {
    const rolesResponse = await client
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          query GetRoles {
            getRoles {
              id
              label
            }
          }
        `,
      });

    originalMemberRoleId = rolesResponse.body.data.getRoles.find(
      (role: { label: string }) => role.label === 'Member',
    ).id;

    companyId = randomUUID();
    personId = randomUUID();

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id name',
        data: { id: companyId, name: 'RestDepthPermissionCompany' },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        data: { id: personId, companyId },
      }),
    );

    const objectMetadataResponse = await makeMetadataAPIRequest({
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
    });

    companyObjectId = objectMetadataResponse.body.data.objects.edges.find(
      (edge: { node: { nameSingular: string } }) =>
        edge.node.nameSingular === 'company',
    ).node.id;

    const fieldMetadataResponse = await makeMetadataAPIRequest({
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
    });

    peopleFieldId = fieldMetadataResponse.body.data.fields.edges.find(
      (edge: { node: { name: string; object: { nameSingular: string } } }) =>
        edge.node.name === 'people' &&
        edge.node.object.nameSingular === 'company',
    ).node.id;
  });

  afterAll(async () => {
    await deleteRecordsByIds('person', [personId]);
    await deleteRecordsByIds('company', [companyId]);
  });

  beforeEach(async () => {
    const { roleId } = await createCustomRoleWithObjectPermissions({
      label: 'RestDepthRelationRole',
      canReadCompany: true,
      canReadPerson: true,
    });

    customRoleId = roleId;

    await updateWorkspaceMemberRole({
      client,
      roleId: customRoleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });
  });

  afterEach(async () => {
    await updateWorkspaceMemberRole({
      client,
      roleId: originalMemberRoleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    if (customRoleId) {
      await deleteRole(client, customRoleId);
      customRoleId = '';
    }
  });

  it('should omit the entire relation when the relation field is restricted for the requesting role', async () => {
    await upsertFieldPermissions({
      roleId: customRoleId,
      fieldPermissions: [
        {
          objectMetadataId: companyObjectId,
          fieldMetadataId: peopleFieldId,
          canReadFieldValue: false,
        },
      ],
    });

    const response = await makeRestAPIRequest({
      method: 'get',
      path: `/companies/${companyId}?depth=1`,
      bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    }).expect(200);

    const company = response.body.data.company;

    expect(company.id).toBe(companyId);
    expect(company).not.toHaveProperty('people');
  });

  it('should include related records when the relation field is not restricted', async () => {
    const response = await makeRestAPIRequest({
      method: 'get',
      path: `/companies/${companyId}?depth=1`,
      bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    }).expect(200);

    const company = response.body.data.company;

    expect(company.id).toBe(companyId);
    expect(company.people).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: personId })]),
    );
  });
});
