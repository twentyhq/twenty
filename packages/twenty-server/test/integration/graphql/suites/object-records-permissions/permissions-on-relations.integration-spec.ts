import { randomUUID } from 'crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createCustomRoleWithObjectPermissions } from 'test/integration/graphql/utils/create-custom-role-with-object-permissions.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';
import { updateWorkspaceMemberRole } from 'test/integration/graphql/utils/update-workspace-member-role.util';
import gql from 'graphql-tag';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('permissionsOnRelations', () => {
  describe('permissions V2 enabled', () => {
    let originalMemberRoleId: string;
    let customRoleId: string;

    beforeAll(async () => {
      // Enable Permissions V2
      const enablePermissionsQuery = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        'IS_PERMISSIONS_V2_ENABLED',
        true,
      );

      const getRolesQuery = {
        query: gql`
          query GetRoles {
            getRoles {
              id
              label
            }
          }
        `,
      };

      await makeGraphqlAPIRequest<any>({ operation: enablePermissionsQuery });

      const rolesResponse = await makeGraphqlAPIRequest<any>({
        operation: getRolesQuery,
      });

      originalMemberRoleId = rolesResponse.data.getRoles.find(
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

      await makeGraphqlAPIRequest<any>({
        operation: graphqlOperationForCompanyCreation,
      });

      const graphqlOperationForPersonCreation = createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        data: {
          id: randomUUID(),
          name: {
            firstName: 'Marie',
          },
          city: 'Paris',
          companyId,
        },
      });

      await makeGraphqlAPIRequest<any>({
        operation: graphqlOperationForPersonCreation,
      });
    });

    afterAll(async () => {
      const restoreMemberRoleQuery = {
        query: gql`
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

      await makeGraphqlAPIRequest({
        operation: restoreMemberRoleQuery,
      });

      // Disable Permissions V2
      const disablePermissionsQuery = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        'IS_PERMISSIONS_V2_ENABLED',
        false,
      );

      await makeGraphqlAPIRequest<any>({ operation: disablePermissionsQuery });
    });

    afterEach(async () => {
      await deleteRole(customRoleId);
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

      const response = await makeGraphqlAPIRequest<any>({
        operation: graphqlOperation,
        options: {
          testingToken: 'MEMBER',
        },
      });

      // The query should fail when trying to access company relation without permission
      expect(response.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
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

      const response = await makeGraphqlAPIRequest<any>({
        operation: graphqlOperation,
        options: {
          testingToken: 'MEMBER',
        },
      });

      // The query should succeed
      expect(response.data).toBeDefined();
      expect(response.data.people).toBeDefined();
      const person = response.data.people.edges[0].node;

      expect(person.company).toBeDefined();
      expect(response.errors).toBeUndefined();
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
        roleId: customRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      });

      // Create a query with nested relations
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
            opportunities {
              edges {
                node {
                  name
                }
              }
            }
          }
        `,
      });

      const response = await makeGraphqlAPIRequest<any>({
        operation: graphqlOperation,
        options: {
          testingToken: 'MEMBER',
        },
      });

      expect(response.errors).toBeDefined();
      expect(response.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });
  });
});
