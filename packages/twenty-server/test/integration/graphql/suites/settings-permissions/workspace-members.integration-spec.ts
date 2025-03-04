import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { restoreOneOperationFactory } from 'test/integration/graphql/utils/restore-one-operation-factory.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/database/typeorm-seeds/core/workspaces';
import { DEV_SEED_WORKSPACE_MEMBER_IDS } from 'src/database/typeorm-seeds/workspace/workspace-members';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

const WORKSPACE_MEMBER_GQL_FIELDS = `
    id
    name {
      firstName
    } 
`;

describe('workspace members permissions', () => {
  beforeAll(async () => {
    const enablePermissionsQuery = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      'IsPermissionsEnabled',
      true,
    );

    await makeGraphqlAPIRequest(enablePermissionsQuery);
  });

  afterAll(async () => {
    const disablePermissionsQuery = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      'IsPermissionsEnabled',
      false,
    );

    await makeGraphqlAPIRequest(disablePermissionsQuery);
  });
  describe('updateOne', () => {
    it('should allow update when user is updating themself (member role)', async () => {
      const graphqlOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'workspaceMember',
        gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
        recordId: DEV_SEED_WORKSPACE_MEMBER_IDS.JONY,
        data: {
          name: {
            firstName: 'Jony',
          },
        },
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expect(response.body.data).toStrictEqual({
        updateWorkspaceMember: {
          id: DEV_SEED_WORKSPACE_MEMBER_IDS.JONY,
          name: {
            firstName: 'Jony',
          },
        },
      });
      expect(response.body.errors).toBeUndefined();
    });
    it('should throw when user does not have permission (member role)', async () => {
      const graphqlOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'workspaceMember',
        gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
        recordId: DEV_SEED_WORKSPACE_MEMBER_IDS.TIM,
        data: {
          name: {
            firstName: 'Not Tim',
          },
        },
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expect(response.body.data).toStrictEqual({ updateWorkspaceMember: null });
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });
  });

  describe('deleteOne', () => {
    afterEach(async () => {
      // Restore the deleted user to maintain test isolation
      const restoreOperation = restoreOneOperationFactory({
        objectMetadataSingularName: 'workspaceMember',
        gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
        recordId: DEV_SEED_WORKSPACE_MEMBER_IDS.JONY,
      });

      await makeGraphqlAPIRequest(restoreOperation);
    });
    it('should allow delete when user is deleting themself (member role)', async () => {
      const deleteOperation = deleteOneOperationFactory({
        objectMetadataSingularName: 'workspaceMember',
        gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
        recordId: DEV_SEED_WORKSPACE_MEMBER_IDS.JONY,
      });

      const deleteResponse =
        await makeGraphqlAPIRequestWithMemberRole(deleteOperation);

      expect(deleteResponse.body.data).toStrictEqual({
        deleteWorkspaceMember: {
          id: DEV_SEED_WORKSPACE_MEMBER_IDS.JONY,
          name: {
            firstName: 'Jony',
          },
        },
      });
      expect(deleteResponse.body.errors).toBeUndefined();
    });

    it('should throw when user does not have permission (member role)', async () => {
      const graphqlOperation = deleteOneOperationFactory({
        objectMetadataSingularName: 'workspaceMember',
        gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
        recordId: DEV_SEED_WORKSPACE_MEMBER_IDS.TIM,
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

      expect(response.body.data).toStrictEqual({ deleteWorkspaceMember: null });
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });
  });

  describe('restoreOne', () => {
    it('should allow restore when user is restoring themself (member role)', async () => {
      const restoreOperation = restoreOneOperationFactory({
        objectMetadataSingularName: 'workspaceMember',
        gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
        recordId: DEV_SEED_WORKSPACE_MEMBER_IDS.JONY,
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(restoreOperation);

      expect(response.body.data).toStrictEqual({
        restoreWorkspaceMember: {
          id: DEV_SEED_WORKSPACE_MEMBER_IDS.JONY,
          name: {
            firstName: 'Jony',
          },
        },
      });
      expect(response.body.errors).toBeUndefined();
    });

    it('should throw when user does not have permission (member role)', async () => {
      const restoreOperation = restoreOneOperationFactory({
        objectMetadataSingularName: 'workspaceMember',
        gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
        recordId: DEV_SEED_WORKSPACE_MEMBER_IDS.TIM,
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(restoreOperation);

      expect(response.body.data).toStrictEqual({
        restoreWorkspaceMember: null,
      });
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });
  });

  describe('createOne', () => {
    it('should throw when user does not have permission (member role)', async () => {
      const createOperation = createOneOperationFactory({
        objectMetadataSingularName: 'workspaceMember',
        gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
        data: {
          userId: 'cc80c2e9-3002-46ac-bcc6-24e524713f21',
          name: {
            firstName: 'New',
          },
        },
      });

      const response =
        await makeGraphqlAPIRequestWithMemberRole(createOperation);

      expect(response.body.data).toStrictEqual({
        createWorkspaceMember: null,
      });
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });
  });
});
