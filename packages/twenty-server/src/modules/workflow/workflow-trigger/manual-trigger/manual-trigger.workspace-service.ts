import { Injectable } from '@nestjs/common';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type ManualTriggerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/manual-trigger.workspace-entity';
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
        const manualTriggerRepository =
          await this.globalWorkspaceOrmManager.getRepository<ManualTriggerWorkspaceEntity>(
            workspaceId,
            'manualTrigger',
          );

        await manualTriggerRepository.insert({
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
        const manualTriggerRepository =
          await this.globalWorkspaceOrmManager.getRepository<ManualTriggerWorkspaceEntity>(
            workspaceId,
            'manualTrigger',
          );

        await manualTriggerRepository.delete({
          workflowVersionId,
        });
      },
    );
  }
}
