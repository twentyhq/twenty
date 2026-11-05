/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { buildRolePermissionsPrincipals } from 'src/engine/permissions/internal/principal/utils/build-role-permissions-principals.util';
import { canAuthContextHoldRoles } from 'src/engine/permissions/internal/principal/utils/can-auth-context-hold-roles.util';
import { resolvePermissionsPrincipalsWithRoles } from 'src/engine/permissions/internal/principal/utils/resolve-permissions-principals-with-roles.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class PrincipalPermissionsService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async buildPermissionsPrincipalsOrThrow({
    authContext,
  }: {
    authContext: PermissionsAuthContext;
  }): Promise<PermissionsPrincipalsWithRolesContext> {
    const principals = await this.buildPermissionsPrincipals({ authContext });

    if (!isDefined(principals)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }

    return principals;
  }

  async buildUserWorkspacePermissionsPrincipalsOrThrow({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<PermissionsPrincipalsWithRolesContext> {
    const { userWorkspaceRoleMap, flatRoleMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'userWorkspaceRoleMap',
        'flatRoleMaps',
      ]);
    const roleId = userWorkspaceRoleMap[userWorkspaceId];

    const flatRole = isDefined(roleId)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: roleId,
          flatEntityMaps: flatRoleMaps,
        })
      : undefined;

    if (!isDefined(flatRole)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
        PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
        {
          userFriendlyMessage: msg`Your role in this workspace could not be found. Please contact your workspace administrator.`,
        },
      );
    }

    return buildRolePermissionsPrincipals({
      workspaceId,
      roleId: flatRole.id,
    });
  }

  async buildPermissionsPrincipals({
    authContext,
  }: {
    authContext: PermissionsAuthContext;
  }): Promise<PermissionsPrincipalsWithRolesContext | undefined> {
    if (!canAuthContextHoldRoles(authContext)) {
      return undefined;
    }

    const workspaceId = authContext.workspace.id;
    const {
      userWorkspaceRoleMap,
      apiKeyRoleMap,
      flatRoleTargetByAgentIdMaps,
      flatApplicationMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'userWorkspaceRoleMap',
      'apiKeyRoleMap',
      'flatRoleTargetByAgentIdMaps',
      'flatApplicationMaps',
    ]);

    return resolvePermissionsPrincipalsWithRoles({
      authContext,
      roleMaps: {
        userWorkspaceRoleMap,
        apiKeyRoleMap,
        flatRoleTargetByAgentIdMaps,
        flatApplicationMaps,
        flatWorkspaceMemberMaps:
          await this.findFlatWorkspaceMemberMaps(authContext),
        flatRoleTargetMaps: await this.findFlatRoleTargetMaps(authContext),
      },
    });
  }

  private async findFlatWorkspaceMemberMaps(
    authContext: PermissionsAuthContext,
  ) {
    if (authContext.type !== 'user') {
      return undefined;
    }

    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(
        authContext.workspace.id,
        ['flatWorkspaceMemberMaps'],
      );

    return flatWorkspaceMemberMaps;
  }

  private async findFlatRoleTargetMaps(authContext: PermissionsAuthContext) {
    if (authContext.type !== 'webhook') {
      return undefined;
    }

    const { flatRoleTargetMaps } =
      await this.workspaceCacheService.getOrRecompute(
        authContext.workspace.id,
        ['flatRoleTargetMaps'],
      );

    return flatRoleTargetMaps;
  }
}
