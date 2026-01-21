import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkflowHandleStaledRunsWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-handle-staled-runs.workspace-service';

export const WORKFLOW_HANDLE_STALED_RUNS_CRON_PATTERN = '0 * * * *';

@Processor(MessageQueue.cronQueue)
export class WorkflowHandleStaledRunsJob {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workflowHandleStaledRunsWorkspaceService: WorkflowHandleStaledRunsWorkspaceService,
  ) {}

  @Process(WorkflowHandleStaledRunsJob.name)
  @SentryCronMonitor(
    WorkflowHandleStaledRunsJob.name,
    WORKFLOW_HANDLE_STALED_RUNS_CRON_PATTERN,
  )
  async handle() {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    await this.workflowHandleStaledRunsWorkspaceService.handleStaledRuns({
      workspaceIds: activeWorkspaces.map((workspace) => workspace.id),
    });
  }
}
