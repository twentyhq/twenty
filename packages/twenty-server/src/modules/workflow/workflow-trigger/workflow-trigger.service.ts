import { Injectable } from '@nestjs/common';

import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowEventListenerWorkspaceEntity } from 'src/modules/workflow/standard-objects/workflow-event-listener.workspace-entity';
import {
  WorkflowDatabaseEventTrigger,
  WorkflowTrigger,
  WorkflowTriggerType,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/standard-objects/workflow-version.workspace-entity';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/workflow-trigger.exception';

@Injectable()
export class WorkflowTriggerService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async enableWorkflowTrigger(workspaceId: string, workflowVersionId: string) {
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
      );

    const workflowVersion = await workflowVersionRepository.findOne({
      where: {
        id: workflowVersionId,
      },
    });

    if (!workflowVersion) {
      throw new WorkflowTriggerException(
        'Workflow version not found',
        WorkflowTriggerExceptionCode.INVALID_INPUT,
      );
    }

    const trigger = workflowVersion.trigger as unknown as WorkflowTrigger;

    if (!trigger || !trigger?.type) {
      throw new WorkflowTriggerException(
        'Workflow version does not contains trigger',
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
      );
    }

    switch (trigger.type) {
      case WorkflowTriggerType.DATABASE_EVENT:
        await this.upsertWorkflowEventListener(
          workspaceId,
          workflowVersion.workflowId,
          trigger,
        );
        break;
      default:
        break;
    }

    return true;
  }

  private async upsertWorkflowEventListener(
    workspaceId: string,
    workflowId: string,
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

    // TODO: Use upsert when available for workspace entities
    await workflowEventListenerRepository.delete({
      workflowId,
      eventName,
    });

    const workflowEventListener = await workflowEventListenerRepository.create({
      workflowId,
      eventName,
    });

    await workflowEventListenerRepository.save(workflowEventListener);
  }
}
