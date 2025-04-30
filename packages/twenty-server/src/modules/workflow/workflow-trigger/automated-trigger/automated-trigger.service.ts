import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkflowEventListenerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-event-listener.workspace-entity';
import { WorkflowAutomatedTriggerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';

@Injectable()
export class AutomatedTriggerService {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  async addAutomatedTrigger({
    workflowId,
    manager,
    databaseEventName = null,
    cronPattern = null,
  }: {
    workflowId: string;
    manager: EntityManager;
  } & (
    | { databaseEventName: string; cronPattern?: null }
    | { databaseEventName?: null; cronPattern: string }
  )) {
    if (isDefined(databaseEventName)) {
      // Todo: remove workflowEventListenerRepository updates when data are migrated to workflowAutomatedTrigger
      const workflowEventListenerRepository =
        await this.twentyORMManager.getRepository<WorkflowEventListenerWorkspaceEntity>(
          'workflowEventListener',
        );

      const workflowEventListener = workflowEventListenerRepository.create({
        workflowId,
        eventName: databaseEventName,
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
      workflowId,
      databaseEventName,
      cronPattern,
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
