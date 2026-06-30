import { Injectable, Logger } from '@nestjs/common';

import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

const MAX_STEP_LOG_BYTES = 256_000;

const computeSizeBytes = (value: unknown): number => {
  try {
    return Buffer.byteLength(JSON.stringify(value) ?? '', 'utf8');
  } catch {
    return 0;
  }
};

@Injectable()
export class WorkflowRunStepLogWorkspaceService {
  private readonly logger = new Logger(WorkflowRunStepLogWorkspaceService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}
  async setStepLog({
    workflowRunId,
    workspaceId,
    stepId,
    stepLog,
  }: {
    workflowRunId: string;
    workspaceId: string;
    stepId: string;
    stepLog: WorkflowRunStepLog;
  }): Promise<void> {
    const sizeBytes = computeSizeBytes(stepLog);

    if (sizeBytes > MAX_STEP_LOG_BYTES) {
      this.logger.warn(
        `Step log for workflowRun=${workflowRunId} step=${stepId} exceeds cap (${sizeBytes}b > ${MAX_STEP_LOG_BYTES}b) and will be dropped`,
      );

      return;
    }

    const stepLogWithSize: WorkflowRunStepLog = {
      ...stepLog,
      sizeBytes,
    };

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowRunRepository =
        await this.globalWorkspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
          workspaceId,
          'workflowRun',
          { shouldBypassPermissionChecks: true },
        );

      await workflowRunRepository
        .createQueryBuilder()
        .update()
        .set({
          stepLogs: () =>
            `jsonb_set(COALESCE("stepLogs", '{}'::jsonb), ARRAY[:stepId]::text[], :stepLog::jsonb, true)`,
        })
        .where('id = :workflowRunId', { workflowRunId })
        .setParameters({
          stepId,
          stepLog: JSON.stringify(stepLogWithSize),
        })
        .execute();
    }, authContext);
  }
}
