import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import request from 'supertest';
import { createCustomRoleWithObjectPermissions } from 'test/integration/graphql/utils/create-custom-role-with-object-permissions.util';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
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

const COMPANY_GQL_FIELDS_WITH_EMPLOYEES = `
      id
      name
      employees
`;

const COMPANY_GQL_FIELDS_WITHOUT_EMPLOYEES = `
      id
      name
`;
const expectPermissionDeniedError = (response: any) => {
  expect(response.body.errors[0].message).toBe(
    PermissionsExceptionMessage.PERMISSION_DENIED,
  );
  expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
};

describe('Field update permissions restrictions', () => {
  let companyId: string;
  let personId: string;
  let customRoleId: string;
  let companyObjectId: string;
  let restrictedCompanyFieldId: string;
  let originalMemberRoleId: string;

  const restrictUpdateAccessToCompanyEmployee = async (
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
          canUpdateFieldValue: false,
        },
      ],
    });
  };

  const restrictReadAccessToCompanyEmployee = async (
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
      gqlFields: 'id name employees',
      data: { id: companyId, name: 'TestCompany', employees: 10 },
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
      hasAllObjectRecordsReadPermission: true,
      canUpdateCompany: true,
      canUpdatePerson: true,
      canUpdateOpportunities: true,
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

  // describe('should throw an error if updating a restricted field', () => {
  //   beforeEach(async () => {
  //     await restrictUpdateAccessToCompanyEmployee(
  //       customRoleId,
  //       companyObjectId,
  //       restrictedCompanyFieldId,
  //     );
  //   });

  //   it('1. updateMany with restricted field', async () => {
  //     const graphqlOperation = updateManyOperationFactory({
  //       objectMetadataSingularName: 'company',
  //       objectMetadataPluralName: 'companies',
  //       gqlFields: COMPANY_GQL_FIELDS_WITH_EMPLOYEES,
  //       data: { employees: 20 },
  //     });

  //     const response =
  //       await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

  //     expectPermissionDeniedError(response);
  //   });

  //   it('2. updateOne with restricted field', async () => {
  //     const graphqlOperation = updateOneOperationFactory({
  //       objectMetadataSingularName: 'company',
  //       gqlFields: COMPANY_GQL_FIELDS_WITH_EMPLOYEES,
  //       recordId: companyId,
  //       data: { employees: 20 },
  //     });

  //     const response =
  //       await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

  //     expectPermissionDeniedError(response);
  //   });
  // });

  // describe('should succeed if updating non-restricted fields', () => {
  //   beforeEach(async () => {
  //     await restrictUpdateAccessToCompanyEmployee(
  //       customRoleId,
  //       companyObjectId,
  //       restrictedCompanyFieldId,
  //     );
  //   });

  //   it('1. updateMany with non-restricted field', async () => {
  //     const graphqlOperation = updateManyOperationFactory({
  //       objectMetadataSingularName: 'company',
  //       objectMetadataPluralName: 'companies',
  //       gqlFields: COMPANY_GQL_FIELDS_WITHOUT_EMPLOYEES,
  //       data: { name: 'UpdatedCompany' },
  //     });

  //     const response =
  //       await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

  //     expect(response.body.errors).toBeUndefined();
  //     expect(response.body.data).toBeDefined();
  //     expect(response.body.data.updateCompanies[0].name).toBe('UpdatedCompany');
  //   });

  //   it('2. updateOne with non-restricted field', async () => {
  //     const graphqlOperation = updateOneOperationFactory({
  //       objectMetadataSingularName: 'company',
  //       gqlFields: COMPANY_GQL_FIELDS_WITHOUT_EMPLOYEES,
  //       recordId: companyId,
  //       data: { name: 'UpdatedCompany2' },
  //     });

  //     const response =
  //       await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

  //     expect(response.body.errors).toBeUndefined();
  //     expect(response.body.data).toBeDefined();
  //     expect(response.body.data.updateCompany.name).toBe('UpdatedCompany2');
  //   });
  // });

  describe('should throw an error if creating with restricted fields', () => {
    beforeEach(async () => {
      await restrictUpdateAccessToCompanyEmployee(
        customRoleId,
        companyObjectId,
        restrictedCompanyFieldId,
      );
    });

    it('1. createMany with restricted field', async () => {
      const graphqlOperation = createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: COMPANY_GQL_FIELDS_WITH_EMPLOYEES,
        data: [
          { id: randomUUID(), name: 'NewCompany1', employees: 15 },
          { id: randomUUID(), name: 'NewCompany2', employees: 20 },
        ],
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expectPermissionDeniedError(response);
    });

    it('2. createOne with restricted field', async () => {
      const graphqlOperation = createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS_WITH_EMPLOYEES,
        data: { id: randomUUID(), name: 'NewCompany3', employees: 25 },
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expectPermissionDeniedError(response);
    });
  });
  describe('should throw an error if reading restricted fields in update operations', () => {
    beforeEach(async () => {
      await restrictReadAccessToCompanyEmployee(
        customRoleId,
        companyObjectId,
        restrictedCompanyFieldId,
      );
    });

    it('1. updateMany requesting restricted field in response', async () => {
      const graphqlOperation = updateManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: COMPANY_GQL_FIELDS_WITH_EMPLOYEES,
        data: { name: 'UpdatedCompany' },
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expectPermissionDeniedError(response);
    });

    it('2. updateOne requesting restricted field in response', async () => {
      const graphqlOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS_WITH_EMPLOYEES,
        recordId: companyId,
        data: { name: 'UpdatedCompany' },
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expectPermissionDeniedError(response);
    });
  });

  describe('should succeed if not requesting restricted fields in update operations', () => {
    beforeEach(async () => {
      await restrictUpdateAccessToCompanyEmployee(
        customRoleId,
        companyObjectId,
        restrictedCompanyFieldId,
      );
    });

    it('1. updateMany not requesting restricted field in response', async () => {
      const graphqlOperation = updateManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: COMPANY_GQL_FIELDS_WITHOUT_EMPLOYEES,
        data: { name: 'UpdatedCompany' },
        filter: { id: { eq: companyId } },
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.updateCompanies[0].name).toBe('UpdatedCompany');
    });

    it('2. updateOne not requesting restricted field in response', async () => {
      const graphqlOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS_WITHOUT_EMPLOYEES,
        recordId: companyId,
        data: { name: 'UpdatedCompany2' },
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.updateCompany.name).toBe('UpdatedCompany2');
    });
  });
});
