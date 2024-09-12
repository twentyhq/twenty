import { Injectable } from '@nestjs/common';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';

@Injectable()
export class WorkflowCommonWorkspaceService {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  async getWorkflowVersionOrFail(
    workflowVersionId: string,
  ): Promise<WorkflowVersionWorkspaceEntity> {
    if (!workflowVersionId) {
      throw new WorkflowTriggerException(
        'Workflow version ID is required',
        WorkflowTriggerExceptionCode.INVALID_INPUT,
      );
    }

    const workflowVersionRepository =
      await this.twentyORMManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
      );

    const workflowVersion = await workflowVersionRepository.findOne({
      where: {
        id: workflowVersionId,
      },
    });

    return this.getValidWorkflowVersionOrFail(workflowVersion);
  }

  async getValidWorkflowVersionOrFail(
    workflowVersion: WorkflowVersionWorkspaceEntity | null,
  ): Promise<WorkflowVersionWorkspaceEntity> {
    if (!workflowVersion) {
      throw new WorkflowTriggerException(
        'Workflow version not found',
        WorkflowTriggerExceptionCode.INVALID_INPUT,
      );
    }

    // FIXME: For now we will make the trigger optional. Later, we'll have to ensure the trigger is defined when publishing the flow.
    // if (!workflowVersion.trigger) {
    //   throw new WorkflowTriggerException(
    //     'Workflow version does not contains trigger',
    //     WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
    //   );
    // }

    return { ...workflowVersion, trigger: workflowVersion.trigger };
  }
}
