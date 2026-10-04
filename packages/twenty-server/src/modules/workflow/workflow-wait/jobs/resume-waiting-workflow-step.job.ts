import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { RESUME_WAITING_WORKFLOW_STEP_JOB_NAME } from 'src/modules/workflow/workflow-wait/constants/resume-waiting-workflow-step-job-name.constant';
import { WorkflowStepWaitResolverWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-wait-resolver.workspace-service';
import { type ResumeWaitingWorkflowStepJobData } from 'src/modules/workflow/workflow-wait/types/resume-waiting-workflow-step-job-data.type';

@Processor({
  queueName: MessageQueue.delayedJobsQueue,
  scope: Scope.REQUEST,
})
export class ResumeWaitingWorkflowStepJob {
  constructor(
    private readonly workflowStepWaitResolverWorkspaceService: WorkflowStepWaitResolverWorkspaceService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  @Process(RESUME_WAITING_WORKFLOW_STEP_JOB_NAME)
  async handle({
    workspaceId,
    waitId,
    event,
  }: ResumeWaitingWorkflowStepJobData): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workflowStepWaitResolverWorkspaceService.resolve({
          workspaceId,
          waitId,
          event,
        }),
      buildSystemAuthContext(workspaceId),
    );
  }
}
