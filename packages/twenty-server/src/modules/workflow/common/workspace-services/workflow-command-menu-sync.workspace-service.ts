import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CommandMenuItemService } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { getWorkflowCommandMenuItemLabel } from 'src/modules/workflow/workflow-trigger/utils/get-workflow-command-menu-item-label.util';

@Injectable()
export class WorkflowCommandMenuSyncWorkspaceService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly commandMenuItemService: CommandMenuItemService,
  ) {}

  // Keeps the command menu item label of active manual-trigger workflows in sync
  // with the workflow name. The label is otherwise only written at activation.
  async syncCommandMenuItemLabelForWorkflows(
    workflowIds: string[],
    authContext: WorkspaceAuthContext,
  ): Promise<void> {
    const workspaceId = authContext.workspace?.id;

    if (!isDefined(workspaceId) || workflowIds.length === 0) {
      return;
    }

    const workflows =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const workflowRepository =
            await this.globalWorkspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
              workspaceId,
              'workflow',
              { shouldBypassPermissionChecks: true },
            );

          return workflowRepository.find({
            where: { id: In(workflowIds) },
          });
        },
        authContext,
      );

    await Promise.all(
      workflows.map((workflow) => this.syncOneWorkflow(workflow, workspaceId)),
    );
  }

  private async syncOneWorkflow(
    workflow: WorkflowWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    if (!isDefined(workflow.lastPublishedVersionId)) {
      return;
    }

    const existingCommandMenuItem =
      await this.commandMenuItemService.findByWorkflowVersionId(
        workflow.lastPublishedVersionId,
        workspaceId,
      );

    if (!isDefined(existingCommandMenuItem)) {
      return;
    }

    const label = getWorkflowCommandMenuItemLabel(workflow);

    if (
      existingCommandMenuItem.label === label &&
      existingCommandMenuItem.shortLabel === label
    ) {
      return;
    }

    await this.commandMenuItemService.update(
      {
        id: existingCommandMenuItem.id,
        label,
        shortLabel: label,
      },
      workspaceId,
    );
  }
}
