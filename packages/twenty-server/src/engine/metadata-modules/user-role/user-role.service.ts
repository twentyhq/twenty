import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner, In, Not, Repository } from 'typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ADMIN_ROLE } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/roles/admin-role';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class UserRoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(RoleTargetsEntity)
    private readonly roleTargetsRepository: Repository<RoleTargetsEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
  ) {}

  public async assignRoleToUserWorkspace(
    {
      workspaceId,
      userWorkspaceId,
      roleId,
    }: {
      workspaceId: string;
      userWorkspaceId: string;
      roleId: string;
    },
    queryRunner?: QueryRunner,
  ): Promise<void> {
    const validationResult = await this.validateAssignRoleInput({
      userWorkspaceId,
      workspaceId,
      roleId,
    });

    if (validationResult?.roleToAssignIsSameAsCurrentRole) {
      return;
    }

    const roleTargetsRepo = queryRunner
      ? queryRunner.manager.getRepository(RoleTargetsEntity)
      : this.roleTargetsRepository;

    const newRoleTarget = await roleTargetsRepo.save({
      roleId,
      userWorkspaceId,
      workspaceId,
    });

    await roleTargetsRepo.delete({
      userWorkspaceId,
      workspaceId,
      id: Not(newRoleTarget.id),
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

    const allRoleTargets = await this.roleTargetsRepository.find({
      where: {
        userWorkspaceId: In(userWorkspaceIds),
        workspaceId,
      },
      relations: {
        role: {
          permissionFlags: true,
        },
      },
    });

    if (!allRoleTargets.length) {
      return new Map();
    }

    const rolesMap = new Map<string, RoleEntity[]>();

    for (const userWorkspaceId of userWorkspaceIds) {
      const roleTargetsOfUserWorkspace = allRoleTargets.filter(
        (roleTarget) => roleTarget.userWorkspaceId === userWorkspaceId,
      );

      const rolesOfUserWorkspace = roleTargetsOfUserWorkspace
        .map((roleTarget) => roleTarget.role)
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
        { shouldBypassPermissionChecks: true },
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
        {
          userFriendlyMessage: msg`Your role in this workspace could not be found. Please contact your workspace administrator.`,
        },
      );
    }

    if (
      isDefined(roleOfUserWorkspace) &&
      roleOfUserWorkspace.standardId === ADMIN_ROLE.standardId
    ) {
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
        {
          userFriendlyMessage: msg`Your workspace membership could not be found. You may no longer have access to this workspace.`,
        },
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
        {
          userFriendlyMessage: msg`The role you are trying to assign could not be found. It may have been deleted.`,
        },
      );
    }

    if (!role.canBeAssignedToUsers) {
      throw new PermissionsException(
        `Role "${role.label}" cannot be assigned to users`,
        PermissionsExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_USERS,
        {
          userFriendlyMessage: msg`This role cannot be assigned to users. Please select a different role.`,
        },
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

    if (
      !(
        isDefined(currentRole) &&
        currentRole.standardId === ADMIN_ROLE.standardId
      )
    ) {
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
        {
          userFriendlyMessage: msg`You cannot remove the admin role from the last administrator. Please assign another administrator first.`,
        },
      );
    }
  }
}
