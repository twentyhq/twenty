import { Injectable } from '@nestjs/common';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkflowManualTriggerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-manual-trigger.workspace-entity';
import { type ManualTriggerSettings } from 'src/modules/workflow/workflow-trigger/manual-trigger/constants/manual-trigger-settings';

@Injectable()
export class ManualTriggerWorkspaceService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async addManualTrigger({
    workflowId,
    workflowVersionId,
    settings,
    workflowName,
    workspaceId,
  }: {
    workflowId: string;
    workflowVersionId: string;
    settings: ManualTriggerSettings;
    workflowName: string;
    workspaceId: string;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workflowManualTriggerRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowManualTriggerWorkspaceEntity>(
            workspaceId,
            'workflowManualTrigger',
          );

        await workflowManualTriggerRepository.insert({
          workflowId,
          workflowVersionId,
          settings,
          workflowName,
        });
      },
    );
  }

  async deleteManualTrigger({
    workflowVersionId,
    workspaceId,
  }: {
    workflowVersionId: string;
    workspaceId: string;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workflowManualTriggerRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowManualTriggerWorkspaceEntity>(
            workspaceId,
            'workflowManualTrigger',
          );

        await workflowManualTriggerRepository.delete({
          workflowVersionId,
        });
      },
    );
  }
}
