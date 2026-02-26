import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { AgentProfileResolverService } from 'src/modules/agent-profile/services/agent-profile-resolver.service';
import { buildPolicyDisplayName } from 'src/modules/policy/utils/build-policy-display-name.util';

// Sets agentId and name before insert. agentId must be set here (not
// post-query) because RLS predicates validate the record before insert
// and may require agentId to match the current user's agent profile.
@Injectable()
@WorkspaceQueryHook(`policy.createMany`)
export class PolicyCreateManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly agentProfileResolverService: AgentProfileResolverService,
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

    // Auto-assign agentId so RLS predicates pass on insert
    if (isDefined(authContext.workspaceMemberId)) {
      const agentProfileId =
        await this.agentProfileResolverService.resolveAgentProfileId(
          workspace.id,
          authContext.workspaceMemberId,
          authContext,
        );

      if (agentProfileId) {
        for (const record of payload.data) {
          if (!isDefined(record.agentId)) {
            record.agentId = agentProfileId;
          }
        }
      }
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
