import { Scope } from '@nestjs/common';

import isEmpty from 'lodash.isempty';
import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { handleWorkflowTriggerException } from 'src/engine/core-modules/workflow/filters/workflow-trigger-graphql-api-exception.filter';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
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
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Process(WorkflowTriggerJob.name)
  async handle(data: WorkflowTriggerJobData): Promise<void> {
    const authContext = buildSystemAuthContext(data.workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        try {
          const workflowRepository =
            await this.globalWorkspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
              data.workspaceId,
              'workflow',
              { shouldBypassPermissionChecks: true },
            );

          const workflow = await workflowRepository.findOneBy({
            id: data.workflowId,
          });

          if (!workflow) {
            throw new WorkflowTriggerException(
              `Workflow ${data.workflowId} not found in workspace ${data.workspaceId}`,
              WorkflowTriggerExceptionCode.NOT_FOUND,
            );
          }

          if (!workflow.lastPublishedVersionId) {
            throw new WorkflowTriggerException(
              `Workflow ${data.workflowId} has no published version in workspace ${data.workspaceId}`,
              WorkflowTriggerExceptionCode.INTERNAL_ERROR,
            );
          }

          const workflowVersionRepository =
            await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
              data.workspaceId,
              'workflowVersion',
              { shouldBypassPermissionChecks: true },
            );

          const workflowVersion = await workflowVersionRepository.findOneBy({
            id: workflow.lastPublishedVersionId,
          });

          if (!workflowVersion) {
            throw new WorkflowTriggerException(
              `Workflow version ${workflow.lastPublishedVersionId} not found in workspace ${data.workspaceId}`,
              WorkflowTriggerExceptionCode.NOT_FOUND,
            );
          }
          if (workflowVersion.status !== WorkflowVersionStatus.ACTIVE) {
            throw new WorkflowTriggerException(
              `Workflow version ${workflowVersion.id} is not active in workspace ${data.workspaceId}`,
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
          await this.messageQueueService.removeCron({
            jobName: WorkflowTriggerJob.name,
            jobId: data.workflowId,
          });
          handleWorkflowTriggerException(e);
        }
      },
    );
  }
}
