import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { ForbiddenError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';
import { buildPolicyDisplayName } from 'src/modules/policy/utils/build-policy-display-name.util';
import { formatDuration } from 'src/modules/policy/utils/format-duration.util';

@Injectable()
@WorkspaceQueryHook(`policy.updateOne`)
export class PolicyUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs,
  ): Promise<UpdateOneResolverArgs> {
    const workspace = authContext.workspace;

    if (!isDefined(workspace)) {
      return payload;
    }

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const policyRepo = await this.globalWorkspaceOrmManager.getRepository(
        workspace.id,
        'policy',
        { shouldBypassPermissionChecks: true },
      );

      const existing = (await policyRepo.findOne({
        where: { id: payload.id },
      })) as Record<string, unknown> | null;

      // Block edits to policies older than the configured edit window for non-admin users
      if (isDefined(existing?.createdAt)) {
        const editWindowMinutes = await this.getEditWindowMinutes(
          authContext,
          workspace.id,
        );

        if (isDefined(editWindowMinutes)) {
          const createdAt = new Date(existing.createdAt as string);
          const ageMs = Date.now() - createdAt.getTime();
          const editWindowMs = editWindowMinutes * 60 * 1000;

          if (ageMs > editWindowMs) {
            const isAdmin = await this.isUserAdmin(authContext, workspace.id);

            if (!isAdmin) {
              const window = formatDuration(editWindowMs);

              throw new ForbiddenError(
                `Policies older than ${window} can only be edited by administrators`,
                {
                  userFriendlyMessage: msg`This policy can no longer be edited. Only administrators can modify policies after ${window}.`,
                },
              );
            }
          }
        }
      }

      // Auto-derive name when carrier or product changes
      if (
        isDefined(payload.data.carrierId) ||
        isDefined(payload.data.productId)
      ) {
        const carrierId =
          (payload.data.carrierId as string) ??
          (existing?.carrierId as string | null) ??
          null;

        const productId =
          (payload.data.productId as string) ??
          (existing?.productId as string | null) ??
          null;

        const displayName = await buildPolicyDisplayName(
          carrierId,
          productId,
          workspace.id,
          this.globalWorkspaceOrmManager,
        );

        if (displayName) {
          payload.data.name = displayName;
        }
      }
    }, authContext as WorkspaceAuthContext);

    return payload;
  }

  private async getEditWindowMinutes(
    authContext: AuthContext,
    workspaceId: string,
  ): Promise<number | null> {
    const userWorkspaceId = authContext.userWorkspaceId;

    if (!isDefined(userWorkspaceId)) {
      return null;
    }

    const { userWorkspaceRoleMap, rolesPermissions, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'userWorkspaceRoleMap',
        'rolesPermissions',
        'flatObjectMetadataMaps',
      ]);

    const roleId = userWorkspaceRoleMap[userWorkspaceId];

    if (!isDefined(roleId)) {
      return null;
    }

    const policyFlatObjectMetadata = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).find((meta) => meta?.nameSingular === 'policy');

    if (!isDefined(policyFlatObjectMetadata)) {
      return null;
    }

    const objectPermissions =
      rolesPermissions[roleId]?.[policyFlatObjectMetadata.id];

    return objectPermissions?.editWindowMinutes ?? null;
  }

  private async isUserAdmin(
    authContext: AuthContext,
    workspaceId: string,
  ): Promise<boolean> {
    const userWorkspaceId = authContext.userWorkspaceId;

    if (!isDefined(userWorkspaceId)) {
      return false;
    }

    const { userWorkspaceRoleMap, flatRoleMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'userWorkspaceRoleMap',
        'flatRoleMaps',
      ]);

    const roleId = userWorkspaceRoleMap[userWorkspaceId];

    if (!isDefined(roleId)) {
      return false;
    }

    const universalIdentifier = flatRoleMaps.universalIdentifierById[roleId];

    return universalIdentifier === STANDARD_ROLE.admin.universalIdentifier;
  }
}
