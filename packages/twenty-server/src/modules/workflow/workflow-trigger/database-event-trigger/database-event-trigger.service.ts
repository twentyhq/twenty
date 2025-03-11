import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { TraceableSubscriber } from 'src/modules/traceable/listeners/traceable.listener';
import { WorkflowEventListenerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-event-listener.workspace-entity';
import { WorkflowDatabaseEventTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

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

  // Método para registrar listeners
  async registerTraceableSubscriber() {
    console.log('Registrando TraceableSubscriber...');

    const entityManager = await this.twentyORMManager.getEntityManager();

    const connection = entityManager.connection;

    const traceableSubscriber = new TraceableSubscriber();

    connection.subscribers.push(traceableSubscriber);

    console.log('TraceableSubscriber registrado com sucesso.');
  }
}
