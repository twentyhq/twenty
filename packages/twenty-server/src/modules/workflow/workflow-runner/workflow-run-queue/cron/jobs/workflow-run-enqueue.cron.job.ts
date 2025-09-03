import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkflowRunEnqueueWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-enqueue.workspace-service';

export const WORKFLOW_RUN_ENQUEUE_CRON_PATTERN = '*/5 * * * *';

@Processor(MessageQueue.cronQueue)
export class WorkflowRunEnqueueJob {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly workflowRunEnqueueWorkspaceService: WorkflowRunEnqueueWorkspaceService,
  ) {}

  @Process(WorkflowRunEnqueueJob.name)
  @SentryCronMonitor(
    WorkflowRunEnqueueJob.name,
    WORKFLOW_RUN_ENQUEUE_CRON_PATTERN,
  )
  async handle() {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    await this.workflowRunEnqueueWorkspaceService.enqueueRuns({
      workspaceIds: activeWorkspaces.map((workspace) => workspace.id),
    });
  }
}
