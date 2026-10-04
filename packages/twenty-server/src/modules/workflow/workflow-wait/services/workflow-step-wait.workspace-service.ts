import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type WorkflowStepWait } from 'twenty-shared/workflow';
import { Repository } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkflowStepWaitEntity } from 'src/engine/core-modules/workflow/entities/workflow-step-wait.entity';
import { buildRunWorkflowJobOptions } from 'src/modules/workflow/workflow-runner/utils/build-run-workflow-job-options.util';
import { RESUME_WAITING_WORKFLOW_STEP_JOB_NAME } from 'src/modules/workflow/workflow-wait/constants/resume-waiting-workflow-step-job-name.constant';
import { type ResumeWaitingWorkflowStepJobData } from 'src/modules/workflow/workflow-wait/types/resume-waiting-workflow-step-job-data.type';

@Injectable()
export class WorkflowStepWaitWorkspaceService {
  constructor(
    @InjectRepository(WorkflowStepWaitEntity)
    private readonly workflowStepWaitRepository: Repository<WorkflowStepWaitEntity>,
    @InjectMessageQueue(MessageQueue.delayedJobsQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  // An answer wait is resolved through the step's conversation, so it is not stored
  async arm({
    workspaceId,
    workflowRunId,
    stepId,
    wait,
  }: {
    workspaceId: string;
    workflowRunId: string;
    stepId: string;
    wait: WorkflowStepWait;
  }): Promise<void> {
    if (wait.type === 'ANSWER') {
      return;
    }

    const resumeAt =
      wait.type === 'TIME'
        ? new Date(wait.resumeAt)
        : isDefined(wait.expiresAt)
          ? new Date(wait.expiresAt)
          : null;

    // A step waiting again, in a loop or a retry, replaces its previous wait so stale jobs find nothing to claim
    await this.workflowStepWaitRepository.delete({ workflowRunId, stepId });

    const { id: waitId } = await this.workflowStepWaitRepository.save({
      workspaceId,
      workflowRunId,
      stepId,
      wait,
      eventName: wait.type === 'EVENT' ? wait.eventName : null,
      resumeAt,
    });

    if (!isDefined(resumeAt)) {
      return;
    }

    await this.messageQueueService.add<ResumeWaitingWorkflowStepJobData>(
      RESUME_WAITING_WORKFLOW_STEP_JOB_NAME,
      { workspaceId, waitId },
      {
        ...buildRunWorkflowJobOptions(workflowRunId),
        delay: Math.max(resumeAt.getTime() - Date.now(), 0),
      },
    );
  }

  async claim({
    workspaceId,
    waitId,
  }: {
    workspaceId: string;
    waitId: string;
  }): Promise<WorkflowStepWaitEntity | null> {
    const { raw } = await this.workflowStepWaitRepository
      .createQueryBuilder()
      .delete()
      .where('id = :waitId AND "workspaceId" = :workspaceId', {
        waitId,
        workspaceId,
      })
      .returning('*')
      .execute();

    const [claimedWait] = raw as WorkflowStepWaitEntity[];

    return claimedWait ?? null;
  }

  async findEventWaits({
    workspaceId,
    eventName,
  }: {
    workspaceId: string;
    eventName: string;
  }): Promise<WorkflowStepWaitEntity[]> {
    return this.workflowStepWaitRepository.find({
      where: { workspaceId, eventName },
    });
  }

  async cancelRunWaits({
    workspaceId,
    workflowRunId,
  }: {
    workspaceId: string;
    workflowRunId: string;
  }): Promise<void> {
    await this.workflowStepWaitRepository.delete({ workspaceId, workflowRunId });
  }
}
