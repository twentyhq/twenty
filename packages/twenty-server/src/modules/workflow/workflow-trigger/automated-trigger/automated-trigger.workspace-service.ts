import { Injectable } from '@nestjs/common';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  type AutomatedTriggerType,
  type WorkflowAutomatedTriggerWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { type AutomatedTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';

@Injectable()
export class AutomatedTriggerWorkspaceService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async addAutomatedTrigger({
    workflowId,
    type,
    settings,
    workspaceId,
  }: {
    workflowId: string;
    type: AutomatedTriggerType;
    settings: AutomatedTriggerSettings;
    workspaceId: string;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workflowAutomatedTriggerRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowAutomatedTriggerWorkspaceEntity>(
            workspaceId,
            'workflowAutomatedTrigger',
          );

        await workflowAutomatedTriggerRepository.insert({
          type,
          settings,
          workflowId,
        });
      },
    );
  }

  async deleteAutomatedTrigger({
    workflowId,
    workspaceId,
  }: {
    workflowId: string;
    workspaceId: string;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workflowAutomatedTriggerRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowAutomatedTriggerWorkspaceEntity>(
            workspaceId,
            'workflowAutomatedTrigger',
          );

        await workflowAutomatedTriggerRepository.delete({ workflowId });
      },
    );
  }
}
