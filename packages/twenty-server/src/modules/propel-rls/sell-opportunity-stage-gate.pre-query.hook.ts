import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { StageGateService } from 'src/modules/propel-rls/stage-gate.service';
import { STAGE_GATE_CONFIGS } from 'src/modules/propel-rls/stage-gate-configs';

// §8.3 stage gate — sellOpportunity.updateOne. Blocks a forward stage move unless the
// current stage's task is DONE. Logic in StageGateService; config auto-derived.
@WorkspaceQueryHook(`sellOpportunity.updateOne`)
export class SellOpportunityStageGatePreQueryHook implements WorkspacePreQueryHookInstance {
  constructor(private readonly stageGateService: StageGateService) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs,
  ): Promise<UpdateOneResolverArgs> {
    const { stageField, cfg } = STAGE_GATE_CONFIGS['sellOpportunity'];
    const nextStage = (payload.data as Record<string, unknown> | undefined)?.[
      stageField
    ] as string | undefined;

    await this.stageGateService.assertStageMoveAllowed(
      authContext,
      'sellOpportunity',
      stageField,
      payload.id,
      nextStage,
      cfg,
    );

    return payload;
  }
}
