import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildPolicyDisplayName } from 'src/modules/policy/utils/build-policy-display-name.util';

@Injectable()
@WorkspaceQueryHook(`policy.updateMany`)
export class PolicyUpdateManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: UpdateManyResolverArgs,
  ): Promise<UpdateManyResolverArgs> {
    const workspace = authContext.workspace;

    if (!isDefined(workspace)) {
      return payload;
    }

    // Auto-derive name when carrier or product changes in bulk update
    if (
      isDefined(payload.data.carrierId) ||
      isDefined(payload.data.productId)
    ) {
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const displayName = await buildPolicyDisplayName(
            (payload.data.carrierId as string) ?? null,
            (payload.data.productId as string) ?? null,
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
