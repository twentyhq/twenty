/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { buildRolePermissionsPrincipals } from 'src/engine/permissions/internal/principal/utils/build-role-permissions-principals.util';
import { canAuthContextHoldRoles } from 'src/engine/permissions/internal/principal/utils/can-auth-context-hold-roles.util';
import { findUserWorkspaceFlatRoleOrThrow } from 'src/engine/permissions/internal/principal/utils/find-user-workspace-flat-role-or-throw.util';
import { resolvePermissionsPrincipalsWithRoles } from 'src/engine/permissions/internal/principal/utils/resolve-permissions-principals-with-roles.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { ApplicationGrantRoleLookupService } from 'src/engine/core-modules/application/application-grant-role-lookup/services/application-grant-role-lookup.service';

@Injectable()
export class PrincipalPermissionsReadService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationGrantRoleLookupService: ApplicationGrantRoleLookupService,
  ) {}

  async resolvePermissionsPrincipalsOrThrow({
    authContext,
  }: {
    authContext: PermissionsAuthContext;
  }): Promise<PermissionsPrincipalsWithRolesContext> {
    const principals = await this.resolvePermissionsPrincipals({ authContext });

    if (!isDefined(principals)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }

    return principals;
  }

  async resolveUserWorkspacePermissionsPrincipalsOrThrow({
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
    const flatRole = findUserWorkspaceFlatRoleOrThrow({
      userWorkspaceId,
      userWorkspaceRoleMap,
      flatRoleMaps,
    });

    return buildRolePermissionsPrincipals({
      workspaceId,
      roleId: flatRole.id,
    });
  }

  async resolvePermissionsPrincipals({
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
      flatRoleTargetByApplicationIdMaps,
      flatApplicationMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'userWorkspaceRoleMap',
      'apiKeyRoleMap',
      'flatRoleTargetByAgentIdMaps',
      'flatRoleTargetByApplicationIdMaps',
      'flatApplicationMaps',
    ]);

    return resolvePermissionsPrincipalsWithRoles({
      authContext,
      roleMaps: {
        userWorkspaceRoleMap,
        apiKeyRoleMap,
        flatRoleTargetByAgentIdMaps,
        flatRoleTargetByApplicationIdMaps,
        workspaceCustomApplicationId:
          await this.applicationGrantRoleLookupService.findWorkspaceCustomApplicationIdOrThrow(
            workspaceId,
          ),
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
