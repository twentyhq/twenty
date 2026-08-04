import { type Repository } from 'typeorm';

import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type RoleTargetService } from 'src/engine/metadata-modules/role-target/services/role-target.service';
import { type RoleValidationService } from 'src/engine/metadata-modules/role-validation/services/role-validation.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { type GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';

const workspaceId = 'workspace-id';
const roleId = 'role-id';
const workspaceMemberId = 'workspace-member-id';
const targetUserWorkspaceId = 'target-user-workspace-id';
const actingUserWorkspaceId = 'acting-user-workspace-id';

const buildService = (options?: {
  workspaceMember?: { id: string; userId: string } | null;
  userWorkspace?: { id: string } | null;
}) => {
  const workspaceMember =
    options?.workspaceMember === undefined
      ? { id: workspaceMemberId, userId: 'target-user-id' }
      : options.workspaceMember;
  const userWorkspace =
    options?.userWorkspace === undefined
      ? { id: targetUserWorkspaceId }
      : options.userWorkspace;

  const roleTargetRepository = {
    find: jest.fn().mockResolvedValue([]),
  };
  const userWorkspaceRepository = {
    find: jest.fn().mockResolvedValue([{ id: targetUserWorkspaceId }]),
    findOne: jest.fn().mockResolvedValue(userWorkspace),
  };
  const workspaceMemberRepository = {
    findOne: jest.fn().mockResolvedValue(workspaceMember),
  };
  const globalWorkspaceOrmManager = {
    executeInWorkspaceContext: jest.fn((callback: () => unknown) => callback()),
    getRepository: jest.fn().mockResolvedValue(workspaceMemberRepository),
  };
  const roleTargetService = {
    createMany: jest.fn().mockResolvedValue([]),
  };
  const workspaceCacheService = {
    getOrRecompute: jest.fn().mockResolvedValue({
      userWorkspaceRoleMap: { [targetUserWorkspaceId]: 'previous-role-id' },
    }),
  };
  const roleValidationService = {
    validateRoleAssignableToUsersOrThrow: jest
      .fn()
      .mockResolvedValue(undefined),
  };

  const service = new UserRoleService(
    roleTargetRepository as unknown as WorkspaceScopedRepository<RoleTargetEntity>,
    userWorkspaceRepository as unknown as Repository<UserWorkspaceEntity>,
    globalWorkspaceOrmManager as unknown as GlobalWorkspaceOrmManager,
    roleTargetService as unknown as RoleTargetService,
    workspaceCacheService as unknown as WorkspaceCacheService,
    roleValidationService as unknown as RoleValidationService,
  );

  return {
    service,
    roleTargetService,
    roleValidationService,
    userWorkspaceRepository,
  };
};

describe('UserRoleService', () => {
  describe('assignRoleToManyUserWorkspace', () => {
    it('rejects assignments that include the acting user workspace', async () => {
      const { service, roleTargetService } = buildService();

      await expect(
        service.assignRoleToManyUserWorkspace({
          workspaceId,
          userWorkspaceIds: [actingUserWorkspaceId],
          roleId,
          actingUserWorkspaceId,
        }),
      ).rejects.toMatchObject({
        code: PermissionsExceptionCode.CANNOT_UPDATE_SELF_ROLE,
      });

      expect(roleTargetService.createMany).not.toHaveBeenCalled();
    });
  });

  describe('assignRoleToWorkspaceMember', () => {
    it('resolves the member, validates assignability and assigns the role', async () => {
      const { service, roleTargetService, roleValidationService } =
        buildService();

      const result = await service.assignRoleToWorkspaceMember({
        workspaceId,
        workspaceMemberId,
        roleId,
        actingUserWorkspaceId,
      });

      expect(result.userWorkspaceId).toBe(targetUserWorkspaceId);
      expect(
        roleValidationService.validateRoleAssignableToUsersOrThrow,
      ).toHaveBeenCalledWith(roleId, workspaceId);
      expect(roleTargetService.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId,
          createRoleTargetInputs: [
            expect.objectContaining({
              roleId,
              targetId: targetUserWorkspaceId,
            }),
          ],
        }),
      );
    });

    it('rejects assigning a role to the acting user themselves', async () => {
      const { service, roleTargetService } = buildService({
        userWorkspace: { id: actingUserWorkspaceId },
      });

      await expect(
        service.assignRoleToWorkspaceMember({
          workspaceId,
          workspaceMemberId,
          roleId,
          actingUserWorkspaceId,
        }),
      ).rejects.toMatchObject({
        code: PermissionsExceptionCode.CANNOT_UPDATE_SELF_ROLE,
      });

      expect(roleTargetService.createMany).not.toHaveBeenCalled();
    });

    it('throws when the workspace member does not exist', async () => {
      const { service } = buildService({ workspaceMember: null });

      await expect(
        service.assignRoleToWorkspaceMember({
          workspaceId,
          workspaceMemberId,
          roleId,
        }),
      ).rejects.toMatchObject({
        code: PermissionsExceptionCode.WORKSPACE_MEMBER_NOT_FOUND,
      });
    });

    it('propagates assignability rejections from role validation', async () => {
      const { service, roleValidationService, roleTargetService } =
        buildService();

      roleValidationService.validateRoleAssignableToUsersOrThrow.mockRejectedValue(
        new Error('Role cannot be assigned to users'),
      );

      await expect(
        service.assignRoleToWorkspaceMember({
          workspaceId,
          workspaceMemberId,
          roleId,
        }),
      ).rejects.toThrow('Role cannot be assigned to users');

      expect(roleTargetService.createMany).not.toHaveBeenCalled();
    });
  });
});
