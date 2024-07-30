import { Injectable } from '@nestjs/common';

import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowEventListenerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-event-listener.workspace-entity';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/workflow-trigger.exception';
import {
  WorkflowDatabaseEventTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/common/types/workflow-trigger.type';
import { WorkflowCommonService } from 'src/modules/workflow/common/services/workflow-common.services';

@Injectable()
export class WorkflowTriggerService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workflowCommonService: WorkflowCommonService,
  ) {}

  async enableWorkflowTrigger(workspaceId: string, workflowVersionId: string) {
    const workflowVersion = await this.workflowCommonService.getWorkflowVersion(
      workspaceId,
      workflowVersionId,
    );

    switch (workflowVersion.trigger.type) {
      case WorkflowTriggerType.DATABASE_EVENT:
        await this.upsertWorkflowEventListener(
          workspaceId,
          workflowVersion.workflowId,
          workflowVersion.trigger,
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
