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

describe('granularObjectRecordsPermissions', () => {
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

      await makeGraphqlAPIRequest(enablePermissionsQuery);

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
        .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
        .send(getRolesQuery);

      originalMemberRoleId = rolesResponse.body.data.getRoles.find(
        (role: any) => role.label === 'Member',
      ).id;
    });

    afterAll(async () => {
      const restoreMemberRoleQuery = {
        query: `
          mutation UpdateWorkspaceMemberRole {
            updateWorkspaceMemberRole(
              workspaceMemberId: "${DEV_SEED_WORKSPACE_MEMBER_IDS.JONY}"
              roleId: "${originalMemberRoleId}"
            ) {
              id
            }
          }
        `,
      };

      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
        .send(restoreMemberRoleQuery);

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

    it('should throw permission error when querying person while person reading rights are overriden to false', async () => {
      // Arrange
      const { roleId } = await createCustomRoleWithObjectPermissions({
        label: 'PersonReadRightsExcludedRole',
        canReadPerson: false,
      });

      customRoleId = roleId;

      await updateWorkspaceMemberRole({
        client,
        roleId: customRoleId,
        workspaceMemberId: DEV_SEED_WORKSPACE_MEMBER_IDS.JONY,
      });

      // Act
      const graphqlOperation = findOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: `
          id
          city
          jobTitle
        `,
        filter: { city: { eq: 'Seattle' } },
      });

      const companyGraphqlOperation = findOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: `
                  id
                  name
                `,
        filter: { name: { eq: 'Apple' } },
      });

      const personResponse =
        await makeGraphqlAPIRequestWithJony(graphqlOperation);

      const companyResponse = await makeGraphqlAPIRequestWithJony(
        companyGraphqlOperation,
      );

      // Assert
      expect(personResponse.body.errors).toBeDefined();
      expect(personResponse.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(personResponse.body.errors[0].extensions.code).toBe(
        ErrorCode.FORBIDDEN,
      );
      expect(companyResponse.body.data).toBeDefined();
      expect(companyResponse.body.data.company).toBeDefined();
    });

    it('should successfully query person when person reading rights are overriden to true', async () => {
      // Arrange
      const { roleId } = await createCustomRoleWithObjectPermissions({
        label: 'PersonRole',
        canReadPerson: true,
        hasAllObjectRecordsReadPermission: false,
      });

      customRoleId = roleId;

      await updateWorkspaceMemberRole({
        client,
        roleId: customRoleId,
        workspaceMemberId: DEV_SEED_WORKSPACE_MEMBER_IDS.JONY,
      });

      // Act
      const graphqlOperation = findOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: `
          id
          city
          jobTitle
        `,
        filter: { city: { eq: 'Seattle' } },
      });

      const companyGraphqlOperation = findOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: `
                  id
                  name
                `,
        filter: { name: { eq: 'Apple' } },
      });

      const personResponse =
        await makeGraphqlAPIRequestWithJony(graphqlOperation);

      const companyResponse = await makeGraphqlAPIRequestWithJony(
        companyGraphqlOperation,
      );

      // Assert
      expect(personResponse.body.data).toBeDefined();
      expect(personResponse.body.data.person).toBeDefined();
      expect(companyResponse.body.errors).toBeDefined();
      expect(companyResponse.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(companyResponse.body.errors[0].extensions.code).toBe(
        ErrorCode.FORBIDDEN,
      );
    });
  });
});
