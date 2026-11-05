import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { RecordSharePrincipalType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, Not, Repository } from 'typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';
import { resolveRecordSharePrincipalRoleIds } from 'src/engine/permissions/internal/record-share/utils/resolve-record-share-principal-role-ids.util';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { PrincipalPermissionsService } from 'src/engine/permissions/principal-permissions.service';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-role-ids.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectWorkspaceScopedRepository(RoleTargetEntity)
    private readonly roleTargetRepository: WorkspaceScopedRepository<RoleTargetEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly principalPermissionsService: PrincipalPermissionsService,
  ) {}

  public findRoleIds({
    authContext,
  }: {
    authContext: PermissionsAuthContext | undefined;
  }): Promise<string[]> {
    return this.findPrincipalRoleIds(authContext);
  }

  public async hasAnyRole({
    authContext,
  }: {
    authContext: PermissionsAuthContext | undefined;
  }): Promise<boolean> {
    return (await this.findPrincipalRoleIds(authContext)).length > 0;
  }

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
    if (!isNonEmptyArray(userWorkspaceIds)) {
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

  async findWorkspaceMemberRoleIds({
    workspaceId,
    workspaceMemberIds,
  }: {
    workspaceId: string;
    workspaceMemberIds: string[];
  }): Promise<(string | undefined)[]> {
    const { flatWorkspaceMemberMaps, userWorkspaceRoleMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
        'userWorkspaceRoleMap',
      ]);

    return resolveRecordSharePrincipalRoleIds({
      principals: workspaceMemberIds.map((principalId) => ({
        principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
        principalId,
      })),
      flatWorkspaceMemberMaps,
      userWorkspaceRoleMap,
    });
  }

  async findSuccessorUserWorkspace({
    removedUserWorkspace,
    actingUserWorkspaceId,
  }: {
    removedUserWorkspace: Pick<UserWorkspaceEntity, 'id' | 'workspaceId'>;
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

  // Empty for the system, which acts with no role
  private async findPrincipalRoleIds(
    authContext: PermissionsAuthContext | undefined,
  ): Promise<string[]> {
    if (!isDefined(authContext)) {
      return [];
    }

    const principals =
      await this.principalPermissionsService.buildPermissionsPrincipals({
        authContext,
      });

    return isDefined(principals)
      ? getPermissionsPrincipalsRoleIds(principals)
      : [];
  }
}
