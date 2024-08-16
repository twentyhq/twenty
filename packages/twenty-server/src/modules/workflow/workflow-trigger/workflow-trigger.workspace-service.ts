import { Injectable } from '@nestjs/common';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkflowEventListenerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-event-listener.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  WorkflowDatabaseEventTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/common/types/workflow-trigger.type';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workflow-common.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-runner.workspace-service';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/workflow-trigger.exception';

@Injectable()
export class WorkflowTriggerWorkspaceService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
  ) {}

  async runWorkflowVersion(workflowVersionId: string, payload: object) {
    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersion(
        workflowVersionId,
      );

    try {
      return await this.workflowRunnerWorkspaceService.run({
        action: workflowVersion.trigger.nextAction,
        payload,
      });
    } catch (error) {
      throw new WorkflowTriggerException(
        `Error running workflow version ${error}`,
        WorkflowTriggerExceptionCode.INTERNAL_ERROR,
      );
    }
  }

  async enableWorkflowTrigger(workflowVersionId: string) {
    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersion(
        workflowVersionId,
      );

    switch (workflowVersion.trigger.type) {
      case WorkflowTriggerType.DATABASE_EVENT:
        await this.upsertEventListenerAndPublishVersion(
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
      await this.twentyORMManager.getRepository<WorkflowEventListenerWorkspaceEntity>(
        'workflowEventListener',
      );

    const workflowEventListener = await workflowEventListenerRepository.create({
      workflowId,
      eventName,
    });

    const workspaceDataSource = await this.twentyORMManager.getDatasource();

    const workflowRepository =
      await this.twentyORMManager.getRepository<WorkflowWorkspaceEntity>(
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
