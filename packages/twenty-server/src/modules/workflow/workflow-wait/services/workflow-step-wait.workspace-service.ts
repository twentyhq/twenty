import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type WorkflowStepWait } from 'twenty-shared/workflow';
import { v4 } from 'uuid';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkflowStepWaitEntity } from 'src/engine/core-modules/workflow/entities/workflow-step-wait.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { buildRunWorkflowJobOptions } from 'src/modules/workflow/workflow-runner/utils/build-run-workflow-job-options.util';
import { RESUME_WAITING_WORKFLOW_STEP_JOB_NAME } from 'src/modules/workflow/workflow-wait/constants/resume-waiting-workflow-step-job-name.constant';
import { type ResumeWaitingWorkflowStepJobData } from 'src/modules/workflow/workflow-wait/types/resume-waiting-workflow-step-job-data.type';

@Injectable()
export class WorkflowStepWaitWorkspaceService {
  constructor(
    @InjectWorkspaceScopedRepository(WorkflowStepWaitEntity)
    private readonly workflowStepWaitRepository: WorkspaceScopedRepository<WorkflowStepWaitEntity>,
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

    // A step waiting again, in a loop or a retry, replaces its previous wait in one statement.
    // The fresh id leaves stale jobs of the previous wait nothing to claim
    const waitId = v4();

    await this.workflowStepWaitRepository.upsert(
      workspaceId,
      {
        id: waitId,
        workflowRunId,
        stepId,
        wait,
        eventName: wait.type === 'EVENT' ? wait.eventName : null,
        resumeAt,
      },
      ['workflowRunId', 'stepId'],
    );

    if (!isDefined(resumeAt)) {
      return;
    }

    await this.scheduleResolution({
      workspaceId,
      workflowRunId,
      waitId,
      delayMs: resumeAt.getTime() - Date.now(),
    });
  }

  async scheduleResolution({
    workspaceId,
    workflowRunId,
    waitId,
    event,
    attempt,
    recordReadAttempt,
    delayMs = 0,
  }: Omit<ResumeWaitingWorkflowStepJobData, 'workspaceId' | 'waitId'> & {
    workspaceId: string;
    workflowRunId: string;
    waitId: string;
    delayMs?: number;
  }): Promise<void> {
    await this.messageQueueService.add<ResumeWaitingWorkflowStepJobData>(
      RESUME_WAITING_WORKFLOW_STEP_JOB_NAME,
      { workspaceId, waitId, event, attempt, recordReadAttempt },
      {
        ...buildRunWorkflowJobOptions(workflowRunId),
        delay: Math.max(delayMs, 0),
      },
    );
  }

  // A wait stays overdue until its job claims it, so each sweep would queue it again
  async scheduleOverdueResolution({
    workspaceId,
    workflowRunId,
    waitId,
  }: {
    workspaceId: string;
    workflowRunId: string;
    waitId: string;
  }): Promise<void> {
    await this.messageQueueService.add<ResumeWaitingWorkflowStepJobData>(
      RESUME_WAITING_WORKFLOW_STEP_JOB_NAME,
      { workspaceId, waitId },
      {
        ...buildRunWorkflowJobOptions(workflowRunId),
        deduplication: { id: `overdue-workflow-step-wait-${waitId}` },
      },
    );
  }

  async findWait({
    workspaceId,
    waitId,
  }: {
    workspaceId: string;
    waitId: string;
  }): Promise<WorkflowStepWaitEntity | null> {
    return this.workflowStepWaitRepository.findOne(workspaceId, {
      where: { id: waitId },
    });
  }

  async claim({
    workspaceId,
    waitId,
  }: {
    workspaceId: string;
    waitId: string;
  }): Promise<WorkflowStepWaitEntity | null> {
    const [claimedWait] = await this.workflowStepWaitRepository.deleteAndReturn(
      workspaceId,
      { id: waitId },
    );

    return claimedWait ?? null;
  }

  async findEventWaits({
    workspaceId,
    eventName,
  }: {
    workspaceId: string;
    eventName: string;
  }): Promise<WorkflowStepWaitEntity[]> {
    return this.workflowStepWaitRepository.find(workspaceId, {
      where: { eventName },
    });
  }

  async cancelStepWait({
    workspaceId,
    workflowRunId,
    stepId,
  }: {
    workspaceId: string;
    workflowRunId: string;
    stepId: string;
  }): Promise<void> {
    await this.workflowStepWaitRepository.delete(workspaceId, {
      workflowRunId,
      stepId,
    });
  }

  async cancelRunWaits({
    workspaceId,
    workflowRunId,
  }: {
    workspaceId: string;
    workflowRunId: string;
  }): Promise<void> {
    await this.workflowStepWaitRepository.delete(workspaceId, {
      workflowRunId,
    });
  }
}
