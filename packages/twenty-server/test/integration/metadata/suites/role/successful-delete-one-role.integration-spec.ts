import { randomUUID } from 'crypto';

import { type UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type WorkflowRunRecordShareService } from 'src/engine/core-modules/workflow/services/workflow-run-record-share.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { currentUser } from 'test/integration/graphql/suites/user-session/utils/current-user.util';
import { deleteUserFromWorkspace } from 'test/integration/graphql/suites/user-session/utils/delete-user-from-workspace.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';
import { updateWorkspace } from 'test/integration/graphql/utils/update-workspace.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

describe('Role deletion should succeed', () => {
  it('should successfully delete a custom editable role', async () => {
    const { data: createData, errors: createErrors } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Deletable Custom Role',
        description: 'A custom role that can be deleted',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    expect(createErrors).toBeUndefined();
    expect(createData.createOneRole.id).toBeDefined();

    const customRoleId = createData.createOneRole.id;

    const { data, errors } = await deleteOneRole({
      expectToFail: false,
      input: {
        idToDelete: customRoleId,
      },
    });

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(data.deleteOneRole).toBe(customRoleId);
  });

  it('should delete a custom role and verify it can no longer be found', async () => {
    const testLabel = 'Role To Be Deleted And Verified';

    const { data: createData } = await createOneRole({
      expectToFail: false,
      input: {
        label: testLabel,
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    const roleId = createData.createOneRole.id;

    const roleBefore = await findOneRoleByLabel({ label: testLabel });

    expect(roleBefore).toBeDefined();
    expect(roleBefore.id).toBe(roleId);

    const { data, errors } = await deleteOneRole({
      expectToFail: false,
      input: {
        idToDelete: roleId,
      },
    });

    expect(errors).toBeUndefined();
    expect(data.deleteOneRole).toBe(roleId);

    await expect(findOneRoleByLabel({ label: testLabel })).rejects.toThrow(
      `Role with label "${testLabel}" not found`,
    );
  });

  it('should delete a custom role immediately after removing its accepted member', async () => {
    const { data: workspaceData } = await currentUser({
      gqlFields: 'currentWorkspace { isPublicInviteLinkEnabled }',
    });
    const initialPublicInviteLinkEnabled =
      workspaceData.currentUser.currentWorkspace?.isPublicInviteLinkEnabled;

    jestExpectToBeDefined(initialPublicInviteLinkEnabled);

    let workspaceMemberId: string | undefined;
    let roleId: string | undefined;

    try {
      const token = await signUpInWorkspaceAndGetAccessToken(
        `role-deletion-${randomUUID()}@example.com`,
      );
      const { data: memberData } = await currentUser({
        token,
        gqlFields: 'workspaceMember { id } currentUserWorkspace { id }',
      });

      workspaceMemberId = memberData.currentUser.workspaceMember.id;

      const roleLabel = `Removed member role ${randomUUID()}`;
      const { data: createData } = await createOneRole({
        input: { label: roleLabel, canBeAssignedToUsers: true },
      });

      roleId = createData.createOneRole.id;
      await updateWorkspaceMemberRole({
        input: { workspaceMemberId, roleId },
      });

      const userWorkspaceId = memberData.currentUser.currentUserWorkspace?.id;

      jestExpectToBeDefined(userWorkspaceId);
      const { userWorkspaceRoleMap } =
        await getAppProviderByClassName<WorkspaceCacheService>(
          'WorkspaceCacheService',
        ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, ['userWorkspaceRoleMap']);

      expect(userWorkspaceRoleMap[userWorkspaceId]).toBe(roleId);

      const { errors: removalErrors } = await deleteUserFromWorkspace({
        input: { workspaceMemberIdToDelete: workspaceMemberId },
      });

      expect(removalErrors).toBeUndefined();
      workspaceMemberId = undefined;

      const { data, errors } = await deleteOneRole({
        input: { idToDelete: roleId },
      });

      expect(errors).toBeUndefined();
      expect(data.deleteOneRole).toBe(roleId);
      roleId = undefined;
    } finally {
      try {
        if (workspaceMemberId) {
          await deleteUserFromWorkspace({
            input: { workspaceMemberIdToDelete: workspaceMemberId },
          });
        }
        if (roleId) {
          await deleteOneRole({ input: { idToDelete: roleId } });
        }
      } finally {
        await updateWorkspace({
          data: { isPublicInviteLinkEnabled: initialPublicInviteLinkEnabled },
        });
      }
    }
  });

  it('should attempt workflow-run share synchronization even if role cache refresh fails', async () => {
    const workspaceCacheService =
      getAppProviderByClassName<WorkspaceCacheService>('WorkspaceCacheService');
    const workflowRunRecordShareService =
      getAppProviderByClassName<WorkflowRunRecordShareService>(
        'WorkflowRunRecordShareService',
      );
    const cacheError = new Error('Role cache refresh failed');
    const cacheRefreshSpy = jest
      .spyOn(workspaceCacheService, 'invalidateAndRecompute')
      .mockRejectedValueOnce(cacheError);
    const shareSyncSpy = jest.spyOn(
      workflowRunRecordShareService,
      'syncRunsOfCoreWorkflows',
    );

    try {
      await expect(
        getAppProviderByClassName<UserWorkspaceService>(
          'UserWorkspaceService',
        ).deleteUserWorkspace({
          userWorkspaceId: randomUUID(),
          workspaceId: SEED_APPLE_WORKSPACE_ID,
        }),
      ).rejects.toBe(cacheError);
      expect(cacheRefreshSpy).toHaveBeenCalledTimes(1);
      expect(cacheRefreshSpy).toHaveBeenCalledWith(SEED_APPLE_WORKSPACE_ID, [
        'flatRoleTargetMaps',
        'flatRoleMaps',
        'userWorkspaceRoleMap',
      ]);
      expect(shareSyncSpy).toHaveBeenCalledTimes(1);
      expect(shareSyncSpy).toHaveBeenCalledWith({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        coreWorkflowIds: [],
      });
    } finally {
      cacheRefreshSpy.mockRestore();
      shareSyncSpy.mockRestore();
    }
  });
});
