import { Injectable } from '@nestjs/common';
import { isDefined } from 'twenty-shared/utils';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/global-workspace-datasource/types/workspace-transaction-scope.type';
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
    transactionScope,
  }: {
    workflowId: string;
    type: AutomatedTriggerType;
    settings: AutomatedTriggerSettings;
    workspaceId: string;
    transactionScope?: WorkspaceTransactionScope;
  }) {
    if (isDefined(transactionScope)) {
      await transactionScope
        .getRepository<WorkflowAutomatedTriggerWorkspaceEntity>(
          'workflowAutomatedTrigger',
        )
        .insert({ type, settings, workflowId });

      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
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
    }, authContext);
  }

  async deleteAutomatedTrigger({
    workflowId,
    workspaceId,
    transactionScope,
  }: {
    workflowId: string;
    workspaceId: string;
    transactionScope?: WorkspaceTransactionScope;
  }) {
    if (isDefined(transactionScope)) {
      await transactionScope
        .getRepository<WorkflowAutomatedTriggerWorkspaceEntity>(
          'workflowAutomatedTrigger',
        )
        .delete({ workflowId });

      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowAutomatedTriggerRepository =
        await this.globalWorkspaceOrmManager.getRepository<WorkflowAutomatedTriggerWorkspaceEntity>(
          workspaceId,
          'workflowAutomatedTrigger',
        );

      await workflowAutomatedTriggerRepository.delete({ workflowId });
    }, authContext);
  }
}
