import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import request from 'supertest';
import { createCustomRoleWithObjectPermissions } from 'test/integration/graphql/utils/create-custom-role-with-object-permissions.util';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { updateWorkspaceMemberRole } from 'test/integration/graphql/utils/update-workspace-member-role.util';
import { upsertFieldPermissions } from 'test/integration/graphql/utils/upsert-field-permissions.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

const COMPANY_GQL_FIELDS_WITH_PEOPLE_CITY = `
      id
      name
      people {
        edges {
          node {
            id
            name {
              firstName
              lastName
            }
            city
          }
        }
      }
`;

const COMPANY_GQL_FIELDS_WITH_EMPLOYEES = `
      id
      name
      employees
      people {
        edges {
          node {
            id
            name {
              firstName
              lastName
            }
          }
        }
      }
`;

const COMPANY_GQL_FIELDS_WITHOUT_EMPLOYEES_AND_WITHOUT_PEOPLE_CITY = `
      id
      name
      people {
        edges {
          node {
            id
            name {
              firstName
              lastName
            }
          }
        }
      }
`;

const COMPANY_GQL_FIELDS_WITH_PEOPLE_CITY_AGGREGATE = `
      id
      name
      people {
        percentageEmptyCity
      }
`;

const expectPermissionDeniedError = (response: any) => {
  expect(response.body.errors[0].message).toBe(
    PermissionsExceptionMessage.PERMISSION_DENIED,
  );
  expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
};

describe('Field permissions restrictions', () => {
  let companyId: string;
  let personId: string;
  let customRoleId: string;
  let companyObjectId: string;
  let personObjectId: string;
  let restrictedCompanyFieldId: string;
  let restrictedPersonFieldId: string;
  let originalMemberRoleId: string;

  const restrictAccessToCompanyEmployee = async (
    roleId: string,
    companyObjectId: string,
    restrictedCompanyFieldId: string,
  ) => {
    await upsertFieldPermissions({
      roleId,
      fieldPermissions: [
        {
          objectMetadataId: companyObjectId,
          fieldMetadataId: restrictedCompanyFieldId,
          canReadFieldValue: false,
        },
      ],
    });
  };

  const restrictAccessToPersonCity = async (
    roleId: string,
    personObjectId: string,
    restrictedPersonFieldId: string,
  ) => {
    await upsertFieldPermissions({
      roleId,
      fieldPermissions: [
        {
          objectMetadataId: personObjectId,
          fieldMetadataId: restrictedPersonFieldId,
          canReadFieldValue: false,
        },
      ],
    });
  };

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

    // Create a company and a person
    companyId = randomUUID();
    personId = randomUUID();
    const createCompanyOp = createOneOperationFactory({
      objectMetadataSingularName: 'company',
      gqlFields: 'id name',
      data: { id: companyId, name: 'TestCompany' },
    });

    await makeGraphqlAPIRequest(createCompanyOp);
    const createPersonOperation = createOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: 'id city',
      data: { id: personId, city: 'Paris', companyId },
    });

    await makeGraphqlAPIRequest(createPersonOperation);

    // Get object and field metadata IDs
    const getObjectMetadataOp = {
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
    const objectMetadataResponse =
      await makeMetadataAPIRequest(getObjectMetadataOp);
    const objects = objectMetadataResponse.body.data.objects.edges;

    companyObjectId = objects.find(
      (obj: any) => obj.node.nameSingular === 'company',
    ).node.id;
    personObjectId = objects.find(
      (obj: any) => obj.node.nameSingular === 'person',
    ).node.id;

    const getFieldMetadataOp = {
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
    const fieldMetadataResponse =
      await makeMetadataAPIRequest(getFieldMetadataOp);
    const fields = fieldMetadataResponse.body.data.fields.edges;

    restrictedCompanyFieldId = fields.find(
      (field: any) =>
        field.node.name === 'employees' &&
        field.node.object.nameSingular === 'company',
    ).node.id;
    restrictedPersonFieldId = fields.find(
      (field: any) =>
        field.node.name === 'city' &&
        field.node.object.nameSingular === 'person',
    ).node.id;
  });

  afterAll(async () => {
    // Restore original role
    const restoreMemberRoleQuery = {
      query: `
        mutation UpdateWorkspaceMemberRole {
          updateWorkspaceMemberRole(
            workspaceMemberId: "${WORKSPACE_MEMBER_DATA_SEED_IDS.JONY}"
            roleId: "${originalMemberRoleId}"
          ) { id }
        }
      `,
    };

    await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(restoreMemberRoleQuery);
  });

  beforeEach(async () => {
    const { roleId } = await createCustomRoleWithObjectPermissions({
      label: 'CompanyPeopleRole',
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
    if (customRoleId) {
      await deleteRole(client, customRoleId);
      customRoleId = '';
    }
  });

  describe('should throw an error if requesting a restricted field', () => {
    beforeEach(async () => {
      await restrictAccessToCompanyEmployee(
        customRoleId,
        companyObjectId,
        restrictedCompanyFieldId,
      );
    });

    it('1. findMany', async () => {
      const graphqlOperation = findManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: COMPANY_GQL_FIELDS_WITH_EMPLOYEES,
      });
      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expectPermissionDeniedError(response);
    });

    it('2. findOne', async () => {
      const graphqlOperation = findOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS_WITH_EMPLOYEES,
        filter: { id: { eq: companyId } },
      });
      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expectPermissionDeniedError(response);
    });

    it('3. updateMany', async () => {
      const graphqlOperation = updateManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: COMPANY_GQL_FIELDS_WITH_EMPLOYEES,
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expectPermissionDeniedError(response);
    });

    it('4. updateOne', async () => {
      const graphqlOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS_WITH_EMPLOYEES,
        recordId: companyId,
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expectPermissionDeniedError(response);
    });

    it('5. createMany', async () => {
      const graphqlOperation = createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: COMPANY_GQL_FIELDS_WITH_EMPLOYEES,
        data: [
          { id: randomUUID(), name: 'TestCompany' },
          { id: randomUUID(), name: 'TestCompany2' },
        ],
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expectPermissionDeniedError(response);
    });

    it('5. createOne', async () => {
      const graphqlOperation = createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS_WITH_EMPLOYEES,
        data: { id: randomUUID(), name: 'TestCompany3' },
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expectPermissionDeniedError(response);
    });

    it('6. deleteMany', async () => {
      const graphqlOperation = deleteManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: COMPANY_GQL_FIELDS_WITH_EMPLOYEES,
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expectPermissionDeniedError(response);
    });

    it('7. deleteOne', async () => {
      const graphqlOperation = deleteOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS_WITH_EMPLOYEES,
        recordId: companyId,
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expectPermissionDeniedError(response);
    });
  });

  it('2. should throw an error if requesting a restricted field of a related object', async () => {
    await restrictAccessToPersonCity(
      customRoleId,
      personObjectId,
      restrictedPersonFieldId,
    );
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: COMPANY_GQL_FIELDS_WITH_PEOPLE_CITY,
    });
    const response =
      await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

    expectPermissionDeniedError(response);
  });

  it('3. should succeed if restricted fields exist but are not requested', async () => {
    await restrictAccessToCompanyEmployee(
      customRoleId,
      companyObjectId,
      restrictedCompanyFieldId,
    );
    await restrictAccessToPersonCity(
      customRoleId,
      personObjectId,
      restrictedPersonFieldId,
    );

    // Query NOT requesting the restricted field
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: COMPANY_GQL_FIELDS_WITHOUT_EMPLOYEES_AND_WITHOUT_PEOPLE_CITY,
    });
    const response =
      await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeDefined();
    expect(response.body.data.companies.edges[0].node.id).toBeDefined();
  });

  describe('Aggregate operations', () => {
    it('1. should throw an error if requesting a restricted field through aggregates', async () => {
      await restrictAccessToCompanyEmployee(
        customRoleId,
        companyObjectId,
        restrictedCompanyFieldId,
      );

      // Query requesting the aggregate restricted field
      const graphqlOperation = {
        query: gql`
          query Companies {
            companies {
              countEmptyEmployees
            }
          }
        `,
      };
      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expectPermissionDeniedError(response);
    });

    it('2. should throw an error if requesting a restricted field on related object through aggregates', async () => {
      await restrictAccessToPersonCity(
        customRoleId,
        personObjectId,
        restrictedPersonFieldId,
      );

      // Query requesting the aggregate restricted field
      const graphqlOperation = findManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: COMPANY_GQL_FIELDS_WITH_PEOPLE_CITY_AGGREGATE,
      });
      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expectPermissionDeniedError(response);
    });
  });
});
