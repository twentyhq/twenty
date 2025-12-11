import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleTargetService } from 'src/engine/metadata-modules/role-target/services/role-target.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { ADMIN_ROLE } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/roles/admin-role';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class UserRoleService {
  constructor(
    @InjectRepository(RoleTargetEntity)
    private readonly roleTargetRepository: Repository<RoleTargetEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly roleTargetService: RoleTargetService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  public async assignRoleToManyUserWorkspace({
    workspaceId,
    userWorkspaceIds,
    roleId,
  }: {
    workspaceId: string;
    userWorkspaceIds: string[];
    roleId: string;
  }): Promise<void> {
    if (userWorkspaceIds.length === 0) {
      return;
    }

    const userWorkspaceIdsToAssign =
      await this.validateAssignRoleInputsAndGetUserWorkspaceIdsToAssign({
        userWorkspaceIds,
        workspaceId,
        roleId,
      });

    if (userWorkspaceIdsToAssign.length === 0) {
      return;
    }

    await this.roleTargetService.createMany({
      createRoleTargetInputs: userWorkspaceIdsToAssign.map(
        (userWorkspaceId) => ({
          roleId,
          targetId: userWorkspaceId,
          targetMetadataForeignKey: 'userWorkspaceId' as const,
        }),
      ),
      workspaceId,
    });
  }

  public async getRoleIdForUserWorkspace({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<string> {
    const { userWorkspaceRoleMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'userWorkspaceRoleMap',
      ]);

    const roleId = userWorkspaceRoleMap[userWorkspaceId];

    if (!isDefined(roleId)) {
      throw new PermissionsException(
        `User workspace ${userWorkspaceId} has no role assigned`,
        PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
      );
    }

    return roleId;
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

    const allRoleTargets = await this.roleTargetRepository.find({
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
    const authContext = buildSystemAuthContext(workspaceId);

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

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
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
      },
    );
  }

  public async getUserWorkspaceIdsAssignedToRole(
    roleId: string,
    workspaceId: string,
  ): Promise<string[]> {
    const { userWorkspaceRoleMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'userWorkspaceRoleMap',
      ]);

    return Object.entries(userWorkspaceRoleMap)
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

  private async validateAssignRoleInputsAndGetUserWorkspaceIdsToAssign({
    userWorkspaceIds,
    workspaceId,
    roleId,
  }: {
    userWorkspaceIds: string[];
    workspaceId: string;
    roleId: string;
  }): Promise<string[]> {
    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: {
        id: In(userWorkspaceIds),
      },
    });

    const foundUserWorkspaceIds = new Set(
      userWorkspaces.map((userWorkspace) => userWorkspace.id),
    );

    const missingUserWorkspaceIds = userWorkspaceIds.filter(
      (id) => !foundUserWorkspaceIds.has(id),
    );

    if (missingUserWorkspaceIds.length > 0) {
      throw new PermissionsException(
        `User workspaces not found: ${missingUserWorkspaceIds.join(', ')}`,
        PermissionsExceptionCode.USER_WORKSPACE_NOT_FOUND,
        {
          userFriendlyMessage: msg`Some workspace memberships could not be found. They may no longer have access to this workspace.`,
        },
      );
    }

    const rolesByUserWorkspaces = await this.getRolesByUserWorkspaces({
      userWorkspaceIds,
      workspaceId,
    });

    const userWorkspaceIdsToAssign: string[] = [];
    let adminRoleIdToValidate: string | undefined;

    for (const userWorkspaceId of userWorkspaceIds) {
      const currentRole = rolesByUserWorkspaces.get(userWorkspaceId)?.[0];

      if (currentRole?.id === roleId) {
        continue;
      }

      if (
        isDefined(currentRole) &&
        currentRole.standardId === ADMIN_ROLE.standardId
      ) {
        adminRoleIdToValidate = currentRole.id;
      }

      userWorkspaceIdsToAssign.push(userWorkspaceId);
    }

    if (isDefined(adminRoleIdToValidate)) {
      await this.validateMoreThanOneWorkspaceMemberHasAdminRoleOrThrow({
        workspaceId,
        adminRoleId: adminRoleIdToValidate,
      });
    }

    return userWorkspaceIdsToAssign;
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
