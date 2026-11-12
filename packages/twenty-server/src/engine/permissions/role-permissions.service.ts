import { Injectable } from '@nestjs/common';

import { RecordSharePrincipalType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { resolveRecordSharePrincipalRoleIds } from 'src/engine/permissions/internal/record-share/utils/resolve-record-share-principal-role-ids.util';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-role-ids.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectWorkspaceScopedRepository(RoleTargetEntity)
    private readonly roleTargetRepository: WorkspaceScopedRepository<RoleTargetEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly principalPermissionsReadService: PrincipalPermissionsReadService,
  ) {}

  public findRoleIds({
    authContext,
  }: {
    authContext: PermissionsAuthContext | undefined;
  }): Promise<string[]> {
    return this.findPrincipalRoleIds(authContext);
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

  // Empty for the system, which acts with no role
  private async findPrincipalRoleIds(
    authContext: PermissionsAuthContext | undefined,
  ): Promise<string[]> {
    if (!isDefined(authContext)) {
      return [];
    }

    const principals =
      await this.principalPermissionsReadService.resolvePermissionsPrincipals({
        authContext,
      });

    return isDefined(principals)
      ? getPermissionsPrincipalsRoleIds(principals)
      : [];
  }
}
