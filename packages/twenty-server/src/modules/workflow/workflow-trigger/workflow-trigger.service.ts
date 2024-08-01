import { Injectable } from '@nestjs/common';

import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowEventListenerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-event-listener.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  WorkflowDatabaseEventTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/common/types/workflow-trigger.type';
import { WorkflowCommonService } from 'src/modules/workflow/common/workflow-common.services';
import { WorkflowRunnerService } from 'src/modules/workflow/workflow-runner/workflow-runner.service';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/workflow-trigger.exception';

@Injectable()
export class WorkflowTriggerService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workflowCommonService: WorkflowCommonService,
    private readonly workflowRunnerService: WorkflowRunnerService,
  ) {}

  async runWorkflowVersion(
    workspaceId: string,
    workflowVersionId: string,
    payload: object,
  ) {
    const workflowVersion = await this.workflowCommonService.getWorkflowVersion(
      workspaceId,
      workflowVersionId,
    );

    return await this.workflowRunnerService.run({
      action: workflowVersion.trigger.nextAction,
      workspaceId,
      payload,
    });
  }

  async enableWorkflowTrigger(workspaceId: string, workflowVersionId: string) {
    const workflowVersion = await this.workflowCommonService.getWorkflowVersion(
      workspaceId,
      workflowVersionId,
    );

    switch (workflowVersion.trigger.type) {
      case WorkflowTriggerType.DATABASE_EVENT:
        await this.upsertEventListenerAndPublishVersion(
          workspaceId,
          workflowVersion.workflowId,
          workflowVersionId,
          workflowVersion.trigger,
        );
        break;
      default:
        break;
    }

    return true;
  }

  private async upsertEventListenerAndPublishVersion(
    workspaceId: string,
    workflowId: string,
    workflowVersionId: string,
    trigger: WorkflowDatabaseEventTrigger,
  ) {
    const eventName = trigger?.settings?.eventName;

    if (!eventName) {
      throw new WorkflowTriggerException(
        'No event name provided in database event trigger',
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
      );
    }

    const workflowEventListenerRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowEventListenerWorkspaceEntity>(
        workspaceId,
        'workflowEventListener',
      );

    const workflowEventListener = await workflowEventListenerRepository.create({
      workflowId,
      eventName,
    });

    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace(workspaceId);

    const workflowRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowWorkspaceEntity>(
        workspaceId,
        'workflow',
      );

    await workspaceDataSource?.transaction(async (transactionManager) => {
      // TODO: Use upsert when available for workspace entities
      await workflowEventListenerRepository.delete(
        {
          workflowId,
          eventName,
        },
        transactionManager,
      );

      await workflowEventListenerRepository.save(
        workflowEventListener,
        {},
        transactionManager,
      );

      await workflowRepository.update(
        { id: workflowId },
        { publishedVersionId: workflowVersionId },
        transactionManager,
      );
    });
  }
}
