import { Injectable } from '@nestjs/common';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  AutomatedTriggerType,
  WorkflowAutomatedTriggerWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { AutomatedTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';

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
    manager: WorkspaceEntityManager;
    type: AutomatedTriggerType;
    settings: AutomatedTriggerSettings;
  }) {
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
    manager: WorkspaceEntityManager;
  }) {
    const workflowAutomatedTriggerRepository =
      await this.twentyORMManager.getRepository<WorkflowAutomatedTriggerWorkspaceEntity>(
        'workflowAutomatedTrigger',
      );

    await workflowAutomatedTriggerRepository.delete({ workflowId }, manager);
  }
}
