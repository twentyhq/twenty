import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type SystemWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { AgentProfileResolverService } from 'src/modules/agent-profile/services/agent-profile-resolver.service';
import { buildPolicyDisplayName } from 'src/modules/policy/utils/build-policy-display-name.util';

// Sets agentId and name before insert. agentId must be set here (not
// post-query) because RLS predicates validate the record before insert
// and may require agentId to match the current user's agent profile.
// Field-level edit checks are already skipped for INSERT operations.
@Injectable()
@WorkspaceQueryHook(`policy.createOne`)
export class PolicyCreateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly agentProfileResolverService: AgentProfileResolverService,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: CreateOneResolverArgs,
  ): Promise<CreateOneResolverArgs> {
    const workspace = authContext.workspace;

    if (!isDefined(workspace)) {
      return payload;
    }

    // Auto-assign agentId so RLS predicates pass on insert
    if (
      !isDefined(payload.data.agentId) &&
      isDefined(authContext.workspaceMemberId)
    ) {
      const agentProfileId =
        await this.agentProfileResolverService.resolveAgentProfileId(
          workspace.id,
          authContext.workspaceMemberId,
          authContext,
        );

      if (agentProfileId) {
        payload.data.agentId = agentProfileId;
      }
    }

    // Auto-derive name from carrier + product
    if (
      isDefined(payload.data.carrierId) ||
      isDefined(payload.data.productId)
    ) {
      const systemAuthContext: SystemWorkspaceAuthContext = {
        type: 'system',
        workspace,
      };

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
        systemAuthContext,
      );
    }

    return payload;
  }
}
