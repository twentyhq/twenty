import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildPolicyDisplayName } from 'src/modules/policy/utils/build-policy-display-name.util';

@Injectable()
@WorkspaceQueryHook(`policy.updateOne`)
export class PolicyUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
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

    // Auto-derive name when carrier or product changes
    if (
      isDefined(payload.data.carrierId) ||
      isDefined(payload.data.productId)
    ) {
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          // Fetch existing record to get the field not being changed
          const policyRepo = await this.globalWorkspaceOrmManager.getRepository(
            workspace.id,
            'policy',
            { shouldBypassPermissionChecks: true },
          );

          const existing = (await policyRepo.findOne({
            where: { id: payload.id },
          })) as Record<string, unknown> | null;

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
        },
        authContext as WorkspaceAuthContext,
      );
    }

    return payload;
  }
}
