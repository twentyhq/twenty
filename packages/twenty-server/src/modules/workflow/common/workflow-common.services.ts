import { Injectable } from '@nestjs/common';

import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowTrigger } from 'src/modules/workflow/common/types/workflow-trigger.type';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/workflow-trigger.exception';

@Injectable()
export class WorkflowCommonService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async getWorkflowVersion(
    workspaceId: string,
    workflowVersionId: string,
  ): Promise<
    Omit<WorkflowVersionWorkspaceEntity, 'trigger'> & {
      trigger: WorkflowTrigger;
    }
  > {
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
      );

    const workflowVersion = await workflowVersionRepository.findOne({
      where: {
        id: workflowVersionId,
      },
    });

    if (!workflowVersion) {
      throw new WorkflowTriggerException(
        'Workflow version not found',
        WorkflowTriggerExceptionCode.INVALID_INPUT,
      );
    }

    if (!workflowVersion.trigger || !workflowVersion.trigger?.type) {
      throw new WorkflowTriggerException(
        'Workflow version does not contains trigger',
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
      );
    }

    return { ...workflowVersion, trigger: workflowVersion.trigger };
  }
}
