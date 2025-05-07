import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, Not, Repository } from 'typeorm';

import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ADMIN_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/admin-role-label.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserWorkspaceRoleEntity } from 'src/engine/metadata-modules/role/user-workspace-role.entity';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class UserRoleService {
  constructor(
    @InjectRepository(RoleEntity, 'metadata')
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserWorkspaceRoleEntity, 'metadata')
    private readonly userWorkspaceRoleRepository: Repository<UserWorkspaceRoleEntity>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
  ) {}

  public async assignRoleToUserWorkspace({
    workspaceId,
    userWorkspaceId,
    roleId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    roleId: string;
  }): Promise<void> {
    const validationResult = await this.validateAssignRoleInput({
      userWorkspaceId,
      workspaceId,
      roleId,
    });

    if (validationResult?.roleToAssignIsSameAsCurrentRole) {
      return;
    }

    const newUserWorkspaceRole = await this.userWorkspaceRoleRepository.save({
      roleId,
      userWorkspaceId,
      workspaceId,
    });

    await this.userWorkspaceRoleRepository.delete({
      userWorkspaceId,
      workspaceId,
      id: Not(newUserWorkspaceRole.id),
    });

    await this.workspacePermissionsCacheService.recomputeUserWorkspaceRoleMapCache(
      {
        workspaceId,
      },
    );
  }

  public async getRoleIdForUserWorkspace({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId?: string;
  }): Promise<string | undefined> {
    if (!isDefined(userWorkspaceId)) {
      return;
    }

    const userWorkspaceRoleMap =
      await this.workspacePermissionsCacheService.getUserWorkspaceRoleMapFromCache(
        {
          workspaceId,
        },
      );

    return userWorkspaceRoleMap.data[userWorkspaceId];
  }

  public async getRolesByUserWorkspaces({
    userWorkspaceIds,
    workspaceId,
  }: {
    userWorkspaceIds: string[];
    workspaceId: string;
  }): Promise<Map<string, RoleEntity[]>> {
    if (!userWorkspaceIds.length) {
      return new Map();
    }

    const allUserWorkspaceRoles = await this.userWorkspaceRoleRepository.find({
      where: {
        userWorkspaceId: In(userWorkspaceIds),
        workspaceId,
      },
      relations: {
        role: {
          settingPermissions: true,
        },
      },
    });

    if (!allUserWorkspaceRoles.length) {
      return new Map();
    }

    const rolesMap = new Map<string, RoleEntity[]>();

    for (const userWorkspaceId of userWorkspaceIds) {
      const userWorkspaceRolesOfUserWorkspace = allUserWorkspaceRoles.filter(
        (userWorkspaceRole) =>
          userWorkspaceRole.userWorkspaceId === userWorkspaceId,
      );

      const rolesOfUserWorkspace = userWorkspaceRolesOfUserWorkspace
        .map((userWorkspaceRole) => userWorkspaceRole.role)
        .filter(isDefined);

      rolesMap.set(userWorkspaceId, rolesOfUserWorkspace);
    }

    return rolesMap;
  }

  public async getWorkspaceMembersAssignedToRole(
    roleId: string,
    workspaceId: string,
  ): Promise<WorkspaceMemberWorkspaceEntity[]> {
    const userWorkspaceIdsWithRole =
      await this.getUserWorkspaceIdsAssignedToRole(roleId, workspaceId);

    const userIds = await this.userWorkspaceRepository
      .find({
        where: {
          id: In(userWorkspaceIdsWithRole),
        },
      })
      .then((userWorkspaces) =>
        userWorkspaces.map((userWorkspace) => userWorkspace.userId),
      );

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
      );

    const workspaceMembers = await workspaceMemberRepository.find({
      where: {
        userId: In(userIds),
      },
    });

    return workspaceMembers;
  }

  public async getUserWorkspaceIdsAssignedToRole(
    roleId: string,
    workspaceId: string,
  ): Promise<string[]> {
    const userWorkspaceRoleMap =
      await this.workspacePermissionsCacheService.getUserWorkspaceRoleMapFromCache(
        {
          workspaceId,
        },
      );

    return Object.entries(userWorkspaceRoleMap.data)
      .filter(([_, roleIdFromMap]) => roleIdFromMap === roleId)
      .map(([userWorkspaceId]) => userWorkspaceId);
  }

  public async validateUserWorkspaceIsNotUniqueAdminOrThrow({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }) {
    const roleOfUserWorkspace = await this.getRolesByUserWorkspaces({
      userWorkspaceIds: [userWorkspaceId],
      workspaceId,
    }).then((roles) => roles.get(userWorkspaceId)?.[0]);

    if (!isDefined(roleOfUserWorkspace)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
        PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
      );
    }

    if (roleOfUserWorkspace.label === ADMIN_ROLE_LABEL) {
      const adminRole = roleOfUserWorkspace;

      await this.validateMoreThanOneWorkspaceMemberHasAdminRoleOrThrow({
        adminRoleId: adminRole.id,
        workspaceId,
      });
    }
  }

  private async validateAssignRoleInput({
    userWorkspaceId,
    workspaceId,
    roleId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
    roleId: string;
  }) {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        id: userWorkspaceId,
      },
    });

    if (!isDefined(userWorkspace)) {
      throw new PermissionsException(
        'User workspace not found',
        PermissionsExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

    const role = await this.roleRepository.findOne({
      where: {
        id: roleId,
      },
    });

    if (!isDefined(role)) {
      throw new PermissionsException(
        'Role not found',
        PermissionsExceptionCode.ROLE_NOT_FOUND,
      );
    }

    const roles = await this.getRolesByUserWorkspaces({
      userWorkspaceIds: [userWorkspace.id],
      workspaceId,
    });

    const currentRole = roles.get(userWorkspace.id)?.[0];

    if (currentRole?.id === roleId) {
      return {
        roleToAssignIsSameAsCurrentRole: true,
      };
    }

    if (!(currentRole?.label === ADMIN_ROLE_LABEL)) {
      return;
    }

    await this.validateMoreThanOneWorkspaceMemberHasAdminRoleOrThrow({
      workspaceId,
      adminRoleId: currentRole.id,
    });
  }

  private async validateMoreThanOneWorkspaceMemberHasAdminRoleOrThrow({
    adminRoleId,
    workspaceId,
  }: {
    adminRoleId: string;
    workspaceId: string;
  }) {
    const workspaceMembersWithAdminRole =
      await this.getWorkspaceMembersAssignedToRole(adminRoleId, workspaceId);

    if (workspaceMembersWithAdminRole.length === 1) {
      throw new PermissionsException(
        PermissionsExceptionMessage.CANNOT_UNASSIGN_LAST_ADMIN,
        PermissionsExceptionCode.CANNOT_UNASSIGN_LAST_ADMIN,
      );
    }
  }
}
