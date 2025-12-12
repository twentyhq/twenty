import { Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { DataSource, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

export const CLEAN_WORKFLOW_RUN_CRON_PATTERN = '0 0 * * *';

const NUMBER_OF_WORKFLOW_RUNS_TO_KEEP = 1000;

@Processor(MessageQueue.cronQueue)
export class WorkflowCleanWorkflowRunsJob {
  private readonly logger = new Logger(WorkflowCleanWorkflowRunsJob.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  @Process(WorkflowCleanWorkflowRunsJob.name)
  @SentryCronMonitor(
    WorkflowCleanWorkflowRunsJob.name,
    CLEAN_WORKFLOW_RUN_CRON_PATTERN,
  )
  async handle() {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    for (const activeWorkspace of activeWorkspaces) {
      const schemaName = getWorkspaceSchemaName(activeWorkspace.id);

      const authContext = buildSystemAuthContext(activeWorkspace.id);

      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const workflowRunsToDelete = await this.coreDataSource.query(
            `
            WITH ranked_runs AS (
              SELECT id,
                     ROW_NUMBER() OVER (
                        PARTITION BY "workflowId"
                        ORDER BY "createdAt" DESC
                     ) AS rn,
                     "createdAt"
              FROM ${schemaName}."workflowRun"
              WHERE status IN ('${WorkflowRunStatus.COMPLETED}', '${WorkflowRunStatus.FAILED}')
            )
            SELECT id, rn FROM ranked_runs
            WHERE rn > ${NUMBER_OF_WORKFLOW_RUNS_TO_KEEP}
               OR "createdAt" < NOW() - INTERVAL '14 days';
          `,
          );

          const workflowRunRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              activeWorkspace.id,
              WorkflowRunWorkspaceEntity,
              { shouldBypassPermissionChecks: true },
            );

          for (const workflowRunToDelete of workflowRunsToDelete) {
            await workflowRunRepository.delete(workflowRunToDelete.id);
          }

          this.logger.log(
            `Deleted ${workflowRunsToDelete.length} workflow runs for workspace ${activeWorkspace.id} (schema ${schemaName})`,
          );
        },
      );
    }
  }
}
