import { Injectable } from '@nestjs/common';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  type AutomatedTriggerType,
  type WorkflowAutomatedTriggerWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { type AutomatedTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';

@Injectable()
export class AutomatedTriggerWorkspaceService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async addAutomatedTrigger({
    workflowId,
    type,
    settings,
  }: {
    workflowId: string;
    type: AutomatedTriggerType;
    settings: AutomatedTriggerSettings;
  }) {
    const { workspaceId } = this.scopedWorkspaceContextFactory.create();
    if (!workspaceId) {
      throw new Error('Workspace not found');
    }

    const workflowAutomatedTriggerRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowAutomatedTriggerWorkspaceEntity>(
        workspaceId,
        'workflowAutomatedTrigger',
      );

    await workflowAutomatedTriggerRepository.insert({
      type,
      settings,
      workflowId,
    });
  }

  async deleteAutomatedTrigger({ workflowId }: { workflowId: string }) {
    const { workspaceId } = this.scopedWorkspaceContextFactory.create();
    if (!workspaceId) {
      throw new Error('Workspace not found');
    }

    const workflowAutomatedTriggerRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowAutomatedTriggerWorkspaceEntity>(
        workspaceId,
        'workflowAutomatedTrigger',
      );

    await workflowAutomatedTriggerRepository.delete({ workflowId });
  }
}
