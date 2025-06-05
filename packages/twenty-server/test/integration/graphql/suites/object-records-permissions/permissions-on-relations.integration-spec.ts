import { default as request } from 'supertest';
import { createCustomRoleWithObjectPermissions } from 'test/integration/graphql/utils/create-custom-role-with-object-permissions.util';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole as makeGraphqlAPIRequestWithJony } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';
import { updateWorkspaceMemberRole } from 'test/integration/graphql/utils/update-workspace-member-role.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/database/typeorm-seeds/core/workspaces';
import { DEV_SEED_WORKSPACE_MEMBER_IDS } from 'src/database/typeorm-seeds/workspace/workspace-members';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

const client = request(`http://localhost:${APP_PORT}`);

describe('permissionsOnRelations', () => {
  describe('permissions V2 enabled', () => {
    let customRoleId: string;

    beforeAll(async () => {
      // Enable Permissions V2
      const enablePermissionsQuery = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        'IS_PERMISSIONS_V2_ENABLED',
        true,
      );

      await makeGraphqlAPIRequest(enablePermissionsQuery);
    });

    afterAll(async () => {
      // Disable Permissions V2
      const disablePermissionsQuery = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        'IS_PERMISSIONS_V2_ENABLED',
        false,
      );

      await makeGraphqlAPIRequest(disablePermissionsQuery);
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
        workspaceMemberId: DEV_SEED_WORKSPACE_MEMBER_IDS.JONY,
      });

      // Create GraphQL query that includes company relation
      const graphqlOperation = findOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: `
          id
          city
          jobTitle
          company {
            id
            name
          }
        `,
        filter: { name: { lastName: { eq: 'Voulzy' } } },
      });

      const response = await makeGraphqlAPIRequestWithJony(graphqlOperation);

      // The query should fail when trying to access company relation without permission
      expect(response.body.errors).toBeDefined();
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
        workspaceMemberId: DEV_SEED_WORKSPACE_MEMBER_IDS.JONY,
      });

      // Create GraphQL query that includes company relation
      const graphqlOperation = findOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: `
          id
          city
          jobTitle
          company {
            id
            name
          }
        `,
        filter: { name: { lastName: { eq: 'Voulzy' } } },
      });

      const response = await makeGraphqlAPIRequestWithJony(graphqlOperation);

      // The query should succeed
      expect(response.body.data).toBeDefined();
      expect(response.body.data.person).toBeDefined();
      expect(response.body.data.person.company).toBeDefined();
    });

    it('nested relations - should throw permission error when querying nested opportunity relation without opportunity read permission', async () => {
      // For example: person -> company -> opportunity
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
        workspaceMemberId: DEV_SEED_WORKSPACE_MEMBER_IDS.JONY,
      });

      // Create a query with nested relations
      const graphqlOperation = findOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: `
          id
          city
          company {
            id
            name
            opportunities {
              countEmptyAmount
            }
          }
        `,
        filter: { name: { lastName: { eq: 'Voulzy' } } },
      });

      const response = await makeGraphqlAPIRequestWithJony(graphqlOperation);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });
  });
});
