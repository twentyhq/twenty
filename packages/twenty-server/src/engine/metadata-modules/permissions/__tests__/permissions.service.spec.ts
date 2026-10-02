import { PermissionFlagType } from 'twenty-shared/constants';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { type ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('PermissionsService', () => {
  describe('userHasWorkspaceSettingPermissionOrWorkspaceIsBeingCreated', () => {
    let permissionsService: PermissionsService;
    let userHasWorkspaceSettingPermission: jest.SpyInstance;

    beforeEach(() => {
      permissionsService = new PermissionsService(
        {} as WorkspaceCacheService,
        {} as ApiKeyRoleService,
      );

      userHasWorkspaceSettingPermission = jest
        .spyOn(permissionsService, 'userHasWorkspaceSettingPermission')
        .mockResolvedValue(false);
    });

    it.each([
      WorkspaceActivationStatus.PENDING_CREATION,
      WorkspaceActivationStatus.ONGOING_CREATION,
    ])(
      'should grant without checking the setting while the workspace is %s',
      async (activationStatus) => {
        await expect(
          permissionsService.userHasWorkspaceSettingPermissionOrWorkspaceIsBeingCreated(
            {
              workspace: { id: 'workspace-id', activationStatus },
              userWorkspaceId: 'user-workspace-id',
              setting: PermissionFlagType.ROLES,
              applicationId: undefined,
            },
          ),
        ).resolves.toBe(true);

        expect(userHasWorkspaceSettingPermission).not.toHaveBeenCalled();
      },
    );

    it('should delegate to the setting check once the workspace is active', async () => {
      await expect(
        permissionsService.userHasWorkspaceSettingPermissionOrWorkspaceIsBeingCreated(
          {
            workspace: {
              id: 'workspace-id',
              activationStatus: WorkspaceActivationStatus.ACTIVE,
            },
            userWorkspaceId: 'user-workspace-id',
            setting: PermissionFlagType.ROLES,
            apiKeyId: 'api-key-id',
            applicationId: 'application-id',
          },
        ),
      ).resolves.toBe(false);

      expect(userHasWorkspaceSettingPermission).toHaveBeenCalledWith({
        userWorkspaceId: 'user-workspace-id',
        workspaceId: 'workspace-id',
        setting: PermissionFlagType.ROLES,
        apiKeyId: 'api-key-id',
        applicationId: 'application-id',
      });
    });
  });
});
