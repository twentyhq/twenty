import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { WorkflowDatabaseEventTrigger } from 'twenty-shared';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkflowEventListenerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-event-listener.workspace-entity';

@Injectable()
export class DatabaseEventTriggerService {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  async createEventListener(
    workflowId: string,
    trigger: WorkflowDatabaseEventTrigger,
    manager: EntityManager,
  ) {
    const eventName = trigger.settings.eventName;

    const workflowEventListenerRepository =
      await this.twentyORMManager.getRepository<WorkflowEventListenerWorkspaceEntity>(
        'workflowEventListener',
      );

    const workflowEventListener = await workflowEventListenerRepository.create({
      workflowId,
      eventName,
    });

    await workflowEventListenerRepository.save(
      workflowEventListener,
      {},
      manager,
    );
  }

  async deleteEventListener(workflowId: string, manager: EntityManager) {
    const workflowEventListenerRepository =
      await this.twentyORMManager.getRepository<WorkflowEventListenerWorkspaceEntity>(
        'workflowEventListener',
      );

    await workflowEventListenerRepository.delete(
      {
        workflowId,
      },
      manager,
    );
  }
}
