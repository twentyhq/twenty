import { Injectable } from '@nestjs/common';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  type AutomatedTriggerType,
  type WorkflowAutomatedTriggerWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { type AutomatedTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';

@Injectable()
export class AutomatedTriggerWorkspaceService {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  async addAutomatedTrigger({
    workflowId,
    type,
    settings,
  }: {
    workflowId: string;
    type: AutomatedTriggerType;
    settings: AutomatedTriggerSettings;
  }) {
    const workflowAutomatedTriggerRepository =
      await this.twentyORMManager.getRepository<WorkflowAutomatedTriggerWorkspaceEntity>(
        'workflowAutomatedTrigger',
      );

    await workflowAutomatedTriggerRepository.insert({
      type,
      settings,
      workflowId,
    });
  }

  async deleteAutomatedTrigger({ workflowId }: { workflowId: string }) {
    const workflowAutomatedTriggerRepository =
      await this.twentyORMManager.getRepository<WorkflowAutomatedTriggerWorkspaceEntity>(
        'workflowAutomatedTrigger',
      );

    await workflowAutomatedTriggerRepository.delete({ workflowId });
  }
}
