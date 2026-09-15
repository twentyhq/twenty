import { Logger, Scope } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkflowVersionStatus as CoreWorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';
import { WorkflowTriggerExceptionCode } from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import { buildWorkflowRunSource } from 'src/modules/workflow/workflow-trigger/utils/build-workflow-run-source.util';
import {
  type QueuedWorkflowTriggerDispatchIds,
  resolveWorkflowTriggerDispatchMode,
} from 'src/modules/workflow/workflow-trigger/utils/resolve-workflow-trigger-dispatch-mode.util';

export type WorkflowTriggerJobData = {
  workspaceId: string;
  workflowId: string;
  payload: object;
} & QueuedWorkflowTriggerDispatchIds;

@Processor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class WorkflowTriggerJob {
  private readonly logger = new Logger(WorkflowTriggerJob.name);
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(WorkflowTriggerJob.name)
  async handle(data: WorkflowTriggerJobData): Promise<void> {
    const dispatchMode = resolveWorkflowTriggerDispatchMode(data);

    if (dispatchMode.mode === 'INCOMPLETE') {
      this.logger.error(
        `Dispatch ids are half resolved for workflow ${data.workflowId} in workspace ${data.workspaceId}`,
      );
      this.exceptionHandlerService.captureExceptions([
        new Error(
          `Dropped workflow trigger with half resolved dispatch ids for workflow ${data.workflowId} in workspace ${data.workspaceId}`,
        ),
      ]);

      return;
    }

    if (dispatchMode.mode === 'CORE') {
      return this.handleFromCore({
        workspaceId: data.workspaceId,
        coreWorkflowVersionId: dispatchMode.coreWorkflowVersionId,
        workspaceWorkflowVersionId: dispatchMode.workspaceWorkflowVersionId,
        payload: data.payload,
      });
    }

    return this.handleFromWorkspace(data);
  }

  private async handleFromCore({
    workspaceId,
    coreWorkflowVersionId,
    workspaceWorkflowVersionId,
    payload,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    workspaceWorkflowVersionId: string;
    payload: object;
  }): Promise<void> {
    const coreWorkflowVersion =
      await this.workflowVersionCoreSyncService.findCoreVersionById(
        workspaceId,
        coreWorkflowVersionId,
      );

    if (!isDefined(coreWorkflowVersion)) {
      this.logger.error(
        `Core workflow version ${coreWorkflowVersionId} not found in workspace ${workspaceId}`,
      );
      this.exceptionHandlerService.captureExceptions([
        new Error(
          `Dispatched core workflow version ${coreWorkflowVersionId} not found in workspace ${workspaceId}`,
        ),
      ]);

      return;
    }

    if (coreWorkflowVersion.status !== CoreWorkflowVersionStatus.ACTIVE) {
      this.logger.error(
        `Core workflow version ${coreWorkflowVersionId} is not active in workspace ${workspaceId}`,
      );
      this.exceptionHandlerService.captureExceptions([
        new Error(
          `Dropped event enqueued against core version ${coreWorkflowVersionId}, no longer active in workspace ${workspaceId}`,
        ),
      ]);

      return;
    }

    const workspaceWorkflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
        workspaceId,
        workflowVersionId: workspaceWorkflowVersionId,
      });

    if (
      workspaceWorkflowVersion.coreWorkflowVersionId !== coreWorkflowVersionId
    ) {
      this.logger.error(
        `Workspace version ${workspaceWorkflowVersionId} is linked to core version ${workspaceWorkflowVersion.coreWorkflowVersionId} instead of dispatched ${coreWorkflowVersionId} in workspace ${workspaceId}`,
      );
      this.exceptionHandlerService.captureExceptions([
        new Error(
          `Dispatched core version ${coreWorkflowVersionId} no longer matches the twin link of workspace version ${workspaceWorkflowVersionId} in workspace ${workspaceId}`,
        ),
      ]);

      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);
    const workspaceWorkflow =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        async () =>
          this.workspaceOrmManager
            .getRepository<WorkflowWorkspaceEntity>('workflow', {
              shouldBypassPermissionChecks: true,
            })
            .findOneBy({ id: coreWorkflowVersion.workflowId }),
        authContext,
      );

    await this.workflowRunnerWorkspaceService.run({
      workspaceId,
      workflowVersionId: workspaceWorkflowVersionId,
      payload,
      source: buildWorkflowRunSource(workspaceWorkflow?.name),
    });
  }

  private async handleFromWorkspace(
    data: WorkflowTriggerJobData,
  ): Promise<void> {
    const authContext = buildSystemAuthContext(data.workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowRepository =
        this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
          'workflow',
          { shouldBypassPermissionChecks: true },
        );

      const workflow = await workflowRepository.findOneBy({
        id: data.workflowId,
      });

      if (!workflow) {
        this.logger.error(
          `Workflow ${data.workflowId} not found in workspace ${data.workspaceId}`,
          WorkflowTriggerExceptionCode.NOT_FOUND,
        );

        return;
      }

      if (!workflow.lastPublishedVersionId) {
        this.logger.error(
          `Workflow ${data.workflowId} has no published version in workspace ${data.workspaceId}`,
          WorkflowTriggerExceptionCode.INTERNAL_ERROR,
        );

        return;
      }

      const workflowVersion =
        await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
          workspaceId: data.workspaceId,
          workflowVersionId: workflow.lastPublishedVersionId,
        });

      if (workflowVersion.status !== WorkflowVersionStatus.ACTIVE) {
        this.logger.error(
          `Workflow version ${workflowVersion?.id} is not active in workspace ${data.workspaceId}`,
          WorkflowTriggerExceptionCode.INTERNAL_ERROR,
        );

        return;
      }

      await this.workflowRunnerWorkspaceService.run({
        workspaceId: data.workspaceId,
        workflowVersionId: workflow.lastPublishedVersionId,
        payload: data.payload,
        source: buildWorkflowRunSource(workflow.name),
      });
    }, authContext);
  }
}
