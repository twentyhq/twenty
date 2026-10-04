import { randomUUID } from 'crypto';

import { type UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type WorkflowRunRecordShareService } from 'src/engine/core-modules/workflow/services/workflow-run-record-share.service';
import { type WorkspaceUserWorkspaceRoleMapCacheService } from 'src/engine/metadata-modules/role-target/services/workspace-user-workspace-role-map-cache.service';
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

  it.each([false, true])(
    'should delete a custom role immediately after removing its accepted member (cache compute failure: %s)',
    async (cacheComputeFails) => {
      const { data: workspaceData } = await currentUser({
        gqlFields: 'currentWorkspace { isPublicInviteLinkEnabled }',
      });
      const initialPublicInviteLinkEnabled =
        workspaceData.currentUser.currentWorkspace?.isPublicInviteLinkEnabled;

      jestExpectToBeDefined(initialPublicInviteLinkEnabled);

      let workspaceMemberId: string | undefined;
      let roleId: string | undefined;
      let cacheComputeSpy: jest.SpyInstance | undefined;
      const workspaceCacheService =
        getAppProviderByClassName<WorkspaceCacheService>(
          'WorkspaceCacheService',
        );

      try {
        const token = await signUpInWorkspaceAndGetAccessToken(
          `role-deletion-${randomUUID()}@example.com`,
        );
        const { data: memberData } = await currentUser({
          token,
          gqlFields: 'id workspaceMember { id } currentUserWorkspace { id }',
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
        const { userWorkspaceRoleMap, flatWorkspaceMemberMaps } =
          await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
            'userWorkspaceRoleMap',
            'flatWorkspaceMemberMaps',
          ]);

        expect(userWorkspaceRoleMap[userWorkspaceId]).toBe(roleId);
        expect(flatWorkspaceMemberMaps.byId[workspaceMemberId]).toBeDefined();

        if (cacheComputeFails) {
          cacheComputeSpy = jest
            .spyOn(
              getAppProviderByClassName<WorkspaceUserWorkspaceRoleMapCacheService>(
                'WorkspaceUserWorkspaceRoleMapCacheService',
              ),
              'computeForCache',
            )
            .mockImplementationOnce(() => {
              throw new Error('Role cache compute failed after flush');
            });
        }

        const removedWorkspaceMemberId = workspaceMemberId;
        const { errors: removalErrors } = await deleteUserFromWorkspace({
          input: { workspaceMemberIdToDelete: workspaceMemberId },
        });

        expect(removalErrors).toBeUndefined();
        workspaceMemberId = undefined;
        if (cacheComputeFails) {
          expect(
            cacheComputeSpy?.mock.results.filter(
              ({ type }) => type === 'throw',
            ),
          ).toHaveLength(1);
        }

        const { data, errors } = await deleteOneRole({
          input: { idToDelete: roleId },
        });

        expect(errors).toBeUndefined();
        expect(data.deleteOneRole).toBe(roleId);
        roleId = undefined;

        const { flatWorkspaceMemberMaps: refreshedWorkspaceMemberMaps } =
          await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
            'flatWorkspaceMemberMaps',
          ]);

        expect(
          refreshedWorkspaceMemberMaps.byId[removedWorkspaceMemberId],
        ).toBeUndefined();
        const [deletedUser]: { deletedAt: Date | null }[] =
          await testDataSource.query(
            'SELECT "deletedAt" FROM core."user" WHERE id = $1',
            [memberData.currentUser.id],
          );

        expect(deletedUser.deletedAt).not.toBeNull();
      } finally {
        cacheComputeSpy?.mockRestore();
        try {
          if (
            workspaceMemberId &&
            (await getAppProviderByClassName<UserWorkspaceService>(
              'UserWorkspaceService',
            ).getWorkspaceMember({
              workspaceMemberId,
              workspaceId: SEED_APPLE_WORKSPACE_ID,
            }))
          ) {
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
    },
  );

  it.each([
    { cacheFails: true, shareFails: false },
    { cacheFails: false, shareFails: true },
    { cacheFails: true, shareFails: true },
  ])(
    'should preserve workflow-run share errors, not cache errors ($cacheFails, $shareFails)',
    async ({ cacheFails, shareFails }) => {
      const workspaceCacheService =
        getAppProviderByClassName<WorkspaceCacheService>(
          'WorkspaceCacheService',
        );
      const userWorkspaceService =
        getAppProviderByClassName<UserWorkspaceService>('UserWorkspaceService');
      const workflowRunRecordShareService =
        getAppProviderByClassName<WorkflowRunRecordShareService>(
          'WorkflowRunRecordShareService',
        );
      const cacheError = new Error('Role cache refresh failed');
      const shareError = new Error('Workflow-run share synchronization failed');
      const userWorkspaceId = randomUUID();
      const cacheRefreshSpy = jest
        .spyOn(workspaceCacheService, 'invalidateAndRecompute')
        .mockResolvedValueOnce();
      const shareSyncSpy = jest.spyOn(
        workflowRunRecordShareService,
        'syncRunsOfCoreWorkflows',
      );
      const loggerSpy = jest
        .spyOn(userWorkspaceService['logger'], 'error')
        .mockImplementation();

      if (cacheFails) {
        cacheRefreshSpy.mockReset().mockRejectedValueOnce(cacheError);
      }
      if (shareFails) {
        shareSyncSpy.mockRejectedValueOnce(shareError);
      }

      try {
        const deletion = userWorkspaceService.deleteUserWorkspace({
          userWorkspaceId,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
        });

        if (shareFails) {
          await expect(deletion).rejects.toBe(shareError);
        } else {
          await expect(deletion).resolves.toBeUndefined();
        }
        if (cacheFails) {
          expect(loggerSpy).toHaveBeenCalledWith(
            `Role cache refresh failed after deleting user workspace ${userWorkspaceId} in workspace ${SEED_APPLE_WORKSPACE_ID}`,
          );
        } else {
          expect(loggerSpy).not.toHaveBeenCalled();
        }
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
        loggerSpy.mockRestore();
      }
    },
  );
});
