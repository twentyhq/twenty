import { Injectable } from '@nestjs/common';
import { msg } from '@lingui/core/macro';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  type LaneGateConfig,
  gateBypasses,
  isGatedForwardMove,
} from 'src/modules/propel-rls/stage-gate.util';

// §8.3 — "move when the work is done." Shared logic for the per-lane updateOne
// stage-gate hooks. Looks up the record's current stage and the status of the
// task(s) targeting it; blocks a forward move if the current stage's task isn't DONE.
// All repo reads run inside executeInWorkspaceContext (required by twenty-orm).
@Injectable()
export class StageGateService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  // Throws CommonQueryRunnerException to block; returns void to allow.
  async assertStageMoveAllowed(
    authContext: WorkspaceAuthContext,
    objectMetadataName: string,
    stageField: string,
    recordId: string,
    nextStage: string | undefined,
    cfg: LaneGateConfig,
  ): Promise<void> {
    if (nextStage === undefined) return; // not a stage change
    if (gateBypasses(authContext)) return; // manager / non-user → no gate

    const workspaceId = authContext.workspace.id;
    const systemAuthContext = buildSystemAuthContext(workspaceId);

    const { currentStage, anyDone, hasStageTask, expectedTitle } =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const repo = await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            objectMetadataName,
            { shouldBypassPermissionChecks: true },
          );

          const record = (await repo.findOne({
            where: { id: recordId },
          })) as (Record<string, unknown> & { id: string }) | null;

          const current = record?.[stageField] as string | undefined;

          const title = current
            ? cfg.stageTaskTitleByStage[current]
            : undefined;

          // Short-circuit: not a gated forward move, or no task title for this stage.
          if (!isGatedForwardMove(cfg, current, nextStage) || !title) {
            return {
              currentStage: current,
              anyDone: false,
              hasStageTask: false,
              expectedTitle: title,
            };
          }

          const taskTargetRepo =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              'taskTarget',
              { shouldBypassPermissionChecks: true },
            );

          const targets = (await taskTargetRepo.find({
            where: { [cfg.taskTargetField]: recordId },
            relations: ['task'],
          })) as Array<{ task?: { title?: string; status?: string } | null }>;

          const stageTasks = targets
            .map((t) => t.task)
            .filter(
              (t): t is { title?: string; status?: string } =>
                !!t && t.title === title,
            );

          return {
            currentStage: current,
            anyDone: stageTasks.some((t) => t.status === 'DONE'),
            hasStageTask: stageTasks.length > 0,
            expectedTitle: title,
          };
        },
        systemAuthContext,
      );

    // Allow when: not a gated move (no title), or no stage task exists yet
    // (don't deadlock imported/pre-engine records), or a stage task is DONE.
    if (!expectedTitle) return;
    if (!isGatedForwardMove(cfg, currentStage, nextStage)) return;
    if (!hasStageTask) return;
    if (anyDone) return;

    throw new CommonQueryRunnerException(
      `Stage move blocked: complete "${expectedTitle}" before advancing.`,
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      {
        userFriendlyMessage: msg`Finish the current stage's task before moving this forward.`,
      },
    );
  }
}
