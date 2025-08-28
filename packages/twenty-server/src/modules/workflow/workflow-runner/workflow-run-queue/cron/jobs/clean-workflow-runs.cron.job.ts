import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

export const CLEAN_WORKFLOW_RUN_CRON_PATTERN = '0 0 * * *';

const NUMBER_OF_WORKFLOW_RUNS_TO_KEEP = 1000;

@Processor(MessageQueue.cronQueue)
export class CleanWorkflowRunsJob {
  private readonly logger = new Logger(CleanWorkflowRunsJob.name);

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @Process(CleanWorkflowRunsJob.name)
  @SentryCronMonitor(CleanWorkflowRunsJob.name, CLEAN_WORKFLOW_RUN_CRON_PATTERN)
  async handle() {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();

    for (const activeWorkspace of activeWorkspaces) {
      const schemaName = getWorkspaceSchemaName(activeWorkspace.id);

      const workflowRunsToDelete = await mainDataSource.query(
        `
          WITH ranked_runs AS (
            SELECT id,
                   ROW_NUMBER() OVER (
           PARTITION BY "workflowId"
           ORDER BY "createdAt" DESC
         ) AS rn
            FROM ${schemaName}."workflowRun"
            WHERE status IN ('${WorkflowRunStatus.COMPLETED}', '${WorkflowRunStatus.FAILED}')
          )
          SELECT id, rn FROM ranked_runs WHERE rn > ${NUMBER_OF_WORKFLOW_RUNS_TO_KEEP};
          `,
      );

      const workflowRunRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
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
    }
  }
}
