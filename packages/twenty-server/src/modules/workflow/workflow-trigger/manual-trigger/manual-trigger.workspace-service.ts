import { Injectable } from '@nestjs/common';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  ManualTriggerAvailabilityType,
  type ManualTriggerWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/manual-trigger.workspace-entity';
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

        const availability = settings.availability;
        const availabilityType = availability?.type as
          | ManualTriggerAvailabilityType
          | undefined;

        const availabilityObjectNameSingular =
          availability &&
          (availability.type === ManualTriggerAvailabilityType.SINGLE_RECORD ||
            availability.type === ManualTriggerAvailabilityType.BULK_RECORDS)
            ? availability.objectNameSingular
            : null;

        await manualTriggerRepository.insert({
          workflowId,
          workflowVersionId,
          workflowName,
          label: workflowName,
          icon: settings.icon,
          isPinned: settings.isPinned,
          availabilityType,
          availabilityObjectNameSingular,
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
