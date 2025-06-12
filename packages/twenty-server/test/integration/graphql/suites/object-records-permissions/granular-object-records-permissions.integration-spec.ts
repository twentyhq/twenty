import { default as request } from 'supertest';
import { createCustomRoleWithObjectPermissions } from 'test/integration/graphql/utils/create-custom-role-with-object-permissions.util';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';
import { updateWorkspaceMemberRole } from 'test/integration/graphql/utils/update-workspace-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/utils/make-graphql-api-request.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

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

      await makeGraphqlAPIRequest<any>({ operation: enablePermissionsQuery });

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
        .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
        .send(restoreMemberRoleQuery);

      // Disable Permissions V2
      const disablePermissionsQuery = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        'IS_PERMISSIONS_V2_ENABLED',
        false,
      );

      await makeGraphqlAPIRequest<any>({ operation: disablePermissionsQuery });
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
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      });

      // Act
      const operation = findOneOperationFactory({
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

      const personResponse = await makeGraphqlAPIRequest<any>({
        operation,
        options: {
          testingToken: 'MEMBER',
        },
      });

      const companyResponse = await makeGraphqlAPIRequest<any>({
        operation: companyGraphqlOperation,
        options: {
          testingToken: 'MEMBER',
        },
      });

      // Assert
      expect(personResponse.data).toBeNull();
      expect(personResponse.errors).toBeDefined();
      expect(personResponse.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(personResponse.errors[0].extensions.code).toBe(
        ErrorCode.FORBIDDEN,
      );
      expect(companyResponse.data).toBeDefined();
      expect(companyResponse.data.company).toBeDefined();
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
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      });

      // Act
      const operation = findOneOperationFactory({
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

      const personResponse = await makeGraphqlAPIRequest<any>({
        operation,
        options: {
          testingToken: 'MEMBER',
        },
      });

      const companyResponse = await makeGraphqlAPIRequest<any>({
        operation: companyGraphqlOperation,
        options: {
          testingToken: 'MEMBER',
        },
      });

      // Assert
      expect(personResponse.data).toBeDefined();
      expect(personResponse.data.person).toBeDefined();
      expect(companyResponse.errors).toBeDefined();
      expect(companyResponse.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(companyResponse.errors[0].extensions.code).toBe(
        ErrorCode.FORBIDDEN,
      );
    });
  });
});
