import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkflowEventListenerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-event-listener.workspace-entity';
import {
  AutomatedTriggerType,
  AutomatedTriggerSettings,
  WorkflowAutomatedTriggerWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';

@Injectable()
export class AutomatedTriggerWorkspaceService {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  async addAutomatedTrigger({
    workflowId,
    manager,
    type,
    settings,
  }: {
    workflowId: string;
    manager: EntityManager;
    type: AutomatedTriggerType;
    settings: AutomatedTriggerSettings;
  }) {
    if (type === AutomatedTriggerType.DATABASE_EVENT) {
      // Todo: remove workflowEventListenerRepository updates when data are migrated to workflowAutomatedTrigger
      const workflowEventListenerRepository =
        await this.twentyORMManager.getRepository<WorkflowEventListenerWorkspaceEntity>(
          'workflowEventListener',
        );

      const workflowEventListener = workflowEventListenerRepository.create({
        workflowId,
        eventName: settings.eventName,
      });

      await workflowEventListenerRepository.save(
        workflowEventListener,
        {},
        manager,
      );
      // end-Todo
    }

    const workflowAutomatedTriggerRepository =
      await this.twentyORMManager.getRepository<WorkflowAutomatedTriggerWorkspaceEntity>(
        'workflowAutomatedTrigger',
      );

    const workflowAutomatedTrigger = workflowAutomatedTriggerRepository.create({
      type,
      settings,
      workflowId,
    });

    await workflowAutomatedTriggerRepository.save(
      workflowAutomatedTrigger,
      {},
      manager,
    );
  }

  async deleteAutomatedTrigger({
    workflowId,
    manager,
  }: {
    workflowId: string;
    manager: EntityManager;
  }) {
    // Todo: remove workflowEventListenerRepository updates when data are migrated to workflowAutomatedTrigger
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
    // end-Todo

    const workflowAutomatedTriggerRepository =
      await this.twentyORMManager.getRepository<WorkflowAutomatedTriggerWorkspaceEntity>(
        'workflowAutomatedTrigger',
      );

    await workflowAutomatedTriggerRepository.delete({ workflowId }, manager);
  }
}
