import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { In, Not, Repository } from 'typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

@Injectable()
export class UserRoleReadService {
  constructor(
    @InjectWorkspaceScopedRepository(RoleTargetEntity)
    private readonly roleTargetRepository: WorkspaceScopedRepository<RoleTargetEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async findUserWorkspaceRoleIdOrThrow({
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

  async findRolesByUserWorkspaceIds({
    userWorkspaceIds,
    workspaceId,
  }: {
    userWorkspaceIds: string[];
    workspaceId: string;
  }): Promise<Map<string, RoleEntity[]>> {
    if (!userWorkspaceIds.length) {
      return new Map();
    }

    const allRoleTargets = await this.roleTargetRepository.find(workspaceId, {
      where: {
        userWorkspaceId: In(userWorkspaceIds),
      },
      relations: {
        role: {
          rolePermissionFlags: {
            permissionFlag: true,
          },
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

  async findWorkspaceMembersWithRole({
    roleId,
    workspaceId,
  }: {
    roleId: string;
    workspaceId: string;
  }): Promise<FlatWorkspaceMember[]> {
    const userWorkspaceIdsWithRole = await this.findUserWorkspaceIdsWithRole({
      roleId,
      workspaceId,
    });

    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    return userWorkspaceIdsWithRole
      .map((userWorkspaceId) => {
        const workspaceMemberId =
          flatWorkspaceMemberMaps.idByUserWorkspaceId[userWorkspaceId];

        return isDefined(workspaceMemberId)
          ? flatWorkspaceMemberMaps.byId[workspaceMemberId]
          : undefined;
      })
      .filter(isDefined);
  }

  async findUserWorkspaceIdsWithRole({
    roleId,
    workspaceId,
  }: {
    roleId: string;
    workspaceId: string;
  }): Promise<string[]> {
    const { userWorkspaceRoleMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'userWorkspaceRoleMap',
      ]);

    return Object.entries(userWorkspaceRoleMap)
      .filter(([_, roleIdFromMap]) => roleIdFromMap === roleId)
      .map(([userWorkspaceId]) => userWorkspaceId);
  }

  async validateUserWorkspaceIsNotUniqueAdminOrThrow({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }) {
    const roleOfUserWorkspace = await this.findRolesByUserWorkspaceIds({
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
      roleOfUserWorkspace.universalIdentifier ===
        STANDARD_ROLE.admin.universalIdentifier
    ) {
      const adminRole = roleOfUserWorkspace;

      await this.validateMoreThanOneWorkspaceMemberHasAdminRoleOrThrow({
        adminRoleId: adminRole.id,
        workspaceId,
      });
    }
  }

  async validateMoreThanOneWorkspaceMemberHasAdminRoleOrThrow({
    adminRoleId,
    workspaceId,
  }: {
    adminRoleId: string;
    workspaceId: string;
  }) {
    const workspaceMembersWithAdminRole =
      await this.findWorkspaceMembersWithRole({
        roleId: adminRoleId,
        workspaceId,
      });

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

  async findSuccessorUserWorkspace({
    removedUserWorkspace,
    actingUserWorkspaceId,
  }: {
    removedUserWorkspace: UserWorkspaceEntity;
    actingUserWorkspaceId?: string;
  }): Promise<UserWorkspaceEntity | undefined> {
    const otherUserWorkspaces = await this.userWorkspaceRepository.find({
      where: {
        workspaceId: removedUserWorkspace.workspaceId,
        id: Not(removedUserWorkspace.id),
      },
      order: { createdAt: 'ASC' },
    });

    if (otherUserWorkspaces.length === 0) {
      return undefined;
    }

    const actingUserWorkspace = otherUserWorkspaces.find(
      (otherUserWorkspace) => otherUserWorkspace.id === actingUserWorkspaceId,
    );

    if (isDefined(actingUserWorkspace)) {
      return actingUserWorkspace;
    }

    const rolesByUserWorkspaceId = await this.findRolesByUserWorkspaceIds({
      userWorkspaceIds: otherUserWorkspaces.map(
        (otherUserWorkspace) => otherUserWorkspace.id,
      ),
      workspaceId: removedUserWorkspace.workspaceId,
    });

    const oldestAdminUserWorkspace = otherUserWorkspaces.find(
      (otherUserWorkspace) =>
        rolesByUserWorkspaceId
          .get(otherUserWorkspace.id)
          ?.some(
            (role) =>
              role.universalIdentifier ===
              STANDARD_ROLE.admin.universalIdentifier,
          ),
    );

    return oldestAdminUserWorkspace ?? otherUserWorkspaces[0];
  }
}
