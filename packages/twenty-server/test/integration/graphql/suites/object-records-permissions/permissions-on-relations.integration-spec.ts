import { randomUUID } from 'crypto';

import { default as request } from 'supertest';
import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createCustomRoleWithObjectPermissions } from 'test/integration/graphql/utils/create-custom-role-with-object-permissions.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole as makeGraphqlAPIRequestWithJony } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateWorkspaceMemberRole } from 'test/integration/graphql/utils/update-workspace-member-role.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

describe('permissionsOnRelations', () => {
  let originalMemberRoleId: string;
  let customRoleId: string;
  const personId = randomUUID();

  beforeAll(async () => {
    // Get the original Member role ID for restoration later
    const getRolesQuery = {
      query: `
        query GetRoles {
          getRoles {
            id
            label
          }
        }
      `,
    };

    const rolesResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(getRolesQuery);

    originalMemberRoleId = rolesResponse.body.data.getRoles.find(
      (role: any) => role.label === 'Member',
    ).id;

    // Create a person record
    const companyId = randomUUID();
    const graphqlOperationForCompanyCreation = createOneOperationFactory({
      objectMetadataSingularName: 'company',
      gqlFields: `
          name
        `,
      data: {
        id: companyId,
        name: 'Twenty',
      },
    });

    await makeGraphqlAPIRequest(graphqlOperationForCompanyCreation);

    const graphqlOperationForPersonCreation = createOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      data: {
        id: personId,
        name: {
          firstName: 'Marie',
        },
        city: 'Paris',
        companyId,
      },
    });

    await makeGraphqlAPIRequest(graphqlOperationForPersonCreation);
  });

  afterAll(async () => {
    const restoreMemberRoleQuery = {
      query: `
          mutation UpdateWorkspaceMemberRole {
            updateWorkspaceMemberRole(
              workspaceMemberId: "${WORKSPACE_MEMBER_DATA_SEED_IDS.JONY}"
              roleId: "${originalMemberRoleId}"
            ) {
              id
            }
          }
        `,
    };

    await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(restoreMemberRoleQuery);
  });

  afterEach(async () => {
    await deleteRole(client, customRoleId);
  });

  it('should throw permission error when querying person with company relation without company read permission', async () => {
    // Create a role with person read permission but no company read permission
    const { roleId } = await createCustomRoleWithObjectPermissions({
      label: 'PersonOnlyRole',
      canReadPerson: true,
      canReadCompany: false,
    });

    customRoleId = roleId;

    await updateWorkspaceMemberRole({
      client,
      roleId: customRoleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    // Create GraphQL query that includes company relation
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: `
          id
          city
          jobTitle
          company {
            id
            name
          }
        `,
    });

    const response = await makeGraphqlAPIRequestWithJony(graphqlOperation);

    // The query should fail when trying to access company relation without permission
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should successfully query person with company relation when having both permissions', async () => {
    // Create a role with both person and company read permissions
    const { roleId } = await createCustomRoleWithObjectPermissions({
      label: 'PersonAndCompanyRole',
      canReadPerson: true,
      canReadCompany: true,
    });

    customRoleId = roleId;

    await updateWorkspaceMemberRole({
      client,
      roleId: customRoleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    // Create GraphQL query that includes company relation
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: `
          id
          city
          jobTitle
          company {
            id
            name
          }
        `,
    });

    const response = await makeGraphqlAPIRequestWithJony(graphqlOperation);

    // The query should succeed
    expect(response.body.data).toBeDefined();
    expect(response.body.data.people).toBeDefined();
    const person = response.body.data.people.edges[0].node;

    expect(person.company).toBeDefined();
    expect(response.body.error).toBeUndefined();
  });

  it('nested relations - should throw permission error when querying nested opportunity relation without opportunity read permission', async () => {
    // Where user has person and company read permissions but not opportunity read permission

    const { roleId } = await createCustomRoleWithObjectPermissions({
      label: 'PersonCompanyOnlyRole',
      canReadPerson: true,
      canReadCompany: true,
      canReadOpportunities: false,
    });

    customRoleId = roleId;

    await updateWorkspaceMemberRole({
      client,
      roleId: customRoleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    // Create a query with nested relations
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: `
          id
          city
          jobTitle
          company {
            id
            name
            opportunities {
              edges {
                node {
                  name
                }
              }
            }
          }
        `,
      filter: {
        id: {
          eq: personId,
        },
      },
    });

    const response = await makeGraphqlAPIRequestWithJony(graphqlOperation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });
});
