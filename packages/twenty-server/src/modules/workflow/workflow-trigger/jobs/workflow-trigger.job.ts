import { Scope } from '@nestjs/common';

import { isDefined } from 'class-validator';
import isEmpty from 'lodash.isempty';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';

export type WorkflowTriggerJobData = {
  workspaceId: string;
  workflowId: string;
  payload: object;
};

const DEFAULT_WORKFLOW_NAME = 'Workflow';

@Processor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class WorkflowTriggerJob {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Process(WorkflowTriggerJob.name)
  async handle(data: WorkflowTriggerJobData): Promise<void> {
    try {
      const workflowRepository =
        await this.twentyORMManager.getRepository<WorkflowWorkspaceEntity>(
          'workflow',
        );

      const workflow = await workflowRepository.findOneByOrFail({
        id: data.workflowId,
      });

      if (!workflow.lastPublishedVersionId) {
        throw new WorkflowTriggerException(
          'Workflow has no published version',
          WorkflowTriggerExceptionCode.INTERNAL_ERROR,
        );
      }

      const workflowVersionRepository =
        await this.twentyORMManager.getRepository<WorkflowVersionWorkspaceEntity>(
          'workflowVersion',
        );

      const workflowVersion = await workflowVersionRepository.findOneByOrFail({
        id: workflow.lastPublishedVersionId,
      });

      if (workflowVersion.status !== WorkflowVersionStatus.ACTIVE) {
        throw new WorkflowTriggerException(
          'Workflow version is not active',
          WorkflowTriggerExceptionCode.INTERNAL_ERROR,
        );
      }

      await this.workflowRunnerWorkspaceService.run({
        workspaceId: data.workspaceId,
        workflowVersionId: workflow.lastPublishedVersionId,
        payload: data.payload,
        source: {
          source: FieldActorSource.WORKFLOW,
          name:
            isDefined(workflow.name) && !isEmpty(workflow.name)
              ? workflow.name
              : DEFAULT_WORKFLOW_NAME,
          context: {},
          workspaceMemberId: null,
        },
      });
    } catch (e) {
      // We remove cron if it exists when no valid workflowVersion exists
      await this.messageQueueService.removeCron({
        jobName: WorkflowTriggerJob.name,
        jobId: data.workflowId,
      });
      throw e;
    }
  }
}
