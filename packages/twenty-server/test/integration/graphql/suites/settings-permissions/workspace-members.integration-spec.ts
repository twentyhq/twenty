import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { restoreOneOperationFactory } from 'test/integration/graphql/utils/restore-one-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { makeGraphqlAPIRequest } from 'test/integration/utils/make-graphql-api-request.util';

const WORKSPACE_MEMBER_GQL_FIELDS = `
    id
    name {
      firstName
    } 
`;

describe('workspace members permissions', () => {
  describe('updateOne', () => {
    it('should allow update when user is updating themself (member role)', async () => {
      const operation = updateOneOperationFactory({
        objectMetadataSingularName: 'workspaceMember',
        gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
        recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        data: {
          name: {
            firstName: 'Jony',
          },
        },
      });

      const response = await makeGraphqlAPIRequest<any>({
        operation,
        options: {
          testingToken: 'MEMBER',
        },
      });

      expect(response.data).toStrictEqual({
        updateWorkspaceMember: {
          id: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          name: {
            firstName: 'Jony',
          },
        },
      });
      expect(response.errors).toBeUndefined();
    });
    it('should throw when user does not have permission (member role)', async () => {
      const operation = updateOneOperationFactory({
        objectMetadataSingularName: 'workspaceMember',
        gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
        recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
        data: {
          name: {
            firstName: 'Not Tim',
          },
        },
      });

      const response = await makeGraphqlAPIRequest<any>({
        operation,
        options: {
          testingToken: 'MEMBER',
        },
      });

      expect(response.data).toStrictEqual({ updateWorkspaceMember: null });
      expect(response.errors).toBeDefined();
      expect(response.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });
  });

  describe('deleteOne', () => {
    afterEach(async () => {
      // Restore the deleted user to maintain test isolation
      const operation = restoreOneOperationFactory({
        objectMetadataSingularName: 'workspaceMember',
        gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
        recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      });

      await makeGraphqlAPIRequest<any>({ operation });
    });
    it('should allow delete when user is deleting themself (member role)', async () => {
      const operation = deleteOneOperationFactory({
        objectMetadataSingularName: 'workspaceMember',
        gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
        recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      });

      const response = await makeGraphqlAPIRequest<any>({
        operation,
        options: {
          testingToken: 'MEMBER',
        },
      });

      expect(response.data).toStrictEqual({
        deleteWorkspaceMember: {
          id: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          name: {
            firstName: 'Jony',
          },
        },
      });
      expect(response.errors).toBeUndefined();
    });

    it('should throw when user does not have permission (member role)', async () => {
      const operation = deleteOneOperationFactory({
        objectMetadataSingularName: 'workspaceMember',
        gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
        recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      });

      const response = await makeGraphqlAPIRequest<any>({
        operation,
        options: {
          testingToken: 'MEMBER',
        },
      });

      expect(response.data).toStrictEqual({ deleteWorkspaceMember: null });
      expect(response.errors).toBeDefined();
      expect(response.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });
  });

  describe('restoreOne', () => {
    it('should allow restore when user is restoring themself (member role)', async () => {
      const operation = restoreOneOperationFactory({
        objectMetadataSingularName: 'workspaceMember',
        gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
        recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      });

      const response = await makeGraphqlAPIRequest<any>({
        operation,
        options: {
          testingToken: 'MEMBER',
        },
      });

      expect(response.data).toStrictEqual({
        restoreWorkspaceMember: {
          id: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          name: {
            firstName: 'Jony',
          },
        },
      });
      expect(response.errors).toBeUndefined();
    });

    it('should throw when user does not have permission (member role)', async () => {
      const operation = restoreOneOperationFactory({
        objectMetadataSingularName: 'workspaceMember',
        gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
        recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      });

      const response = await makeGraphqlAPIRequest<any>({
        operation,
        options: {
          testingToken: 'MEMBER',
        },
      });

      expect(response.data).toStrictEqual({
        restoreWorkspaceMember: null,
      });
      expect(response.errors).toBeDefined();
      expect(response.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });
  });

  describe('createOne', () => {
    it('should throw when user does not have permission (member role)', async () => {
      const operation = createOneOperationFactory({
        objectMetadataSingularName: 'workspaceMember',
        gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
        data: {
          userId: 'cc80c2e9-3002-46ac-bcc6-24e524713f21',
          name: {
            firstName: 'New',
          },
        },
      });

      const response = await makeGraphqlAPIRequest<any>({
        operation,
        options: {
          testingToken: 'MEMBER',
        },
      });

      expect(response.data).toStrictEqual({
        createWorkspaceMember: null,
      });
      expect(response.errors).toBeDefined();
      expect(response.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });
  });
});
