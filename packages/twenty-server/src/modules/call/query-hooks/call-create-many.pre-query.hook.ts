import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { AgentProfileResolverService } from 'src/modules/agent-profile/services/agent-profile-resolver.service';

@Injectable()
@WorkspaceQueryHook(`call.createMany`)
export class CallCreateManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly agentProfileResolverService: AgentProfileResolverService,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: CreateManyResolverArgs,
  ): Promise<CreateManyResolverArgs> {
    const workspace = authContext.workspace;

    if (!isDefined(workspace) || !isDefined(authContext.workspaceMemberId)) {
      return payload;
    }

    const recordsWithoutAgent = payload.data.filter(
      (record) => !isDefined(record.agentId),
    );

    if (recordsWithoutAgent.length === 0) {
      return payload;
    }

    const agentProfileId =
      await this.agentProfileResolverService.resolveAgentProfileId(
        workspace.id,
        authContext.workspaceMemberId,
      );

    if (!isDefined(agentProfileId)) {
      return payload;
    }

    for (const record of recordsWithoutAgent) {
      record.agentId = agentProfileId;
    }

    return payload;
  }
}
