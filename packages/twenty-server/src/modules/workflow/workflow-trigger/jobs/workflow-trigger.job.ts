import { Logger, Scope } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import isEmpty from 'lodash.isempty';
import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkflowVersionStatus as CoreWorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';
import { WorkflowTriggerExceptionCode } from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';

export type WorkflowTriggerJobData = {
  workspaceId: string;
  workflowId: string;
  payload: object;
  coreWorkflowId?: string | null;
  coreWorkflowVersionId?: string | null;
  workspaceWorkflowVersionId?: string | null;
};

const DEFAULT_WORKFLOW_NAME = 'Workflow';

@Processor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class WorkflowTriggerJob {
  private readonly logger = new Logger(WorkflowTriggerJob.name);
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
    private readonly workflowCoreSyncService: WorkflowCoreSyncService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(WorkflowTriggerJob.name)
  async handle(data: WorkflowTriggerJobData): Promise<void> {
    if (
      isDefined(data.coreWorkflowId) &&
      isDefined(data.coreWorkflowVersionId) &&
      isDefined(data.workspaceWorkflowVersionId)
    ) {
      return this.handleFromCore({
        workspaceId: data.workspaceId,
        coreWorkflowId: data.coreWorkflowId,
        coreWorkflowVersionId: data.coreWorkflowVersionId,
        workspaceWorkflowVersionId: data.workspaceWorkflowVersionId,
        payload: data.payload,
      });
    }

    return this.handleFromWorkspace(data);
  }

  private async handleFromCore({
    workspaceId,
    coreWorkflowId,
    coreWorkflowVersionId,
    workspaceWorkflowVersionId,
    payload,
  }: {
    workspaceId: string;
    coreWorkflowId: string;
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
        WorkflowTriggerExceptionCode.INTERNAL_ERROR,
      );

      return;
    }

    const workspaceWorkflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
        workspaceId,
        workflowVersionId: workspaceWorkflowVersionId,
      });

    if (workspaceWorkflowVersion.status !== WorkflowVersionStatus.ACTIVE) {
      this.logger.error(
        `Workspace workflow version ${workspaceWorkflowVersionId} is not active in workspace ${workspaceId}`,
      );

      return;
    }

    const coreWorkflow =
      await this.workflowCoreSyncService.findCoreWorkflowById(
        workspaceId,
        coreWorkflowId,
      );

    await this.workflowRunnerWorkspaceService.run({
      workspaceId,
      workflowVersionId: workspaceWorkflowVersionId,
      payload,
      source: {
        source: FieldActorSource.WORKFLOW,
        name: isNonEmptyString(coreWorkflow?.name)
          ? coreWorkflow.name
          : DEFAULT_WORKFLOW_NAME,
        context: {},
        workspaceMemberId: null,
      },
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
    }, authContext);
  }
}
