import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildPolicyDisplayName } from 'src/modules/policy/utils/build-policy-display-name.util';

// Only derives name from carrier + product. All other auto-set fields
// (submittedDate, agentId, LTV) are handled in post-query hooks with
// bypassed permissions to avoid field-level permission failures.
@Injectable()
@WorkspaceQueryHook(`policy.createMany`)
export class PolicyCreateManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: CreateManyResolverArgs,
  ): Promise<CreateManyResolverArgs> {
    const workspace = authContext.workspace;

    if (!isDefined(workspace)) {
      return payload;
    }

    // Auto-derive name from carrier + product
    const recordsWithCarrierOrProduct = payload.data.filter(
      (record) => isDefined(record.carrierId) || isDefined(record.productId),
    );

    if (recordsWithCarrierOrProduct.length > 0) {
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          for (const record of recordsWithCarrierOrProduct) {
            const displayName = await buildPolicyDisplayName(
              (record.carrierId as string) ?? null,
              (record.productId as string) ?? null,
              workspace.id,
              this.globalWorkspaceOrmManager,
            );

            if (displayName) {
              record.name = displayName;
            }
          }
        },
        authContext as WorkspaceAuthContext,
      );
    }

    return payload;
  }
}
