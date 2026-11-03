/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { canAuthContextHoldRoles } from 'src/engine/permissions/principal/utils/can-auth-context-hold-roles.util';
import { resolvePermissionsPrincipalsWithRoles } from 'src/engine/permissions/principal/utils/resolve-permissions-principals-with-roles.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class PermissionsPrincipalsService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async findPrincipalsWithRoles(
    authContext: PermissionsAuthContext,
  ): Promise<PermissionsPrincipalsWithRolesContext | undefined> {
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
