import { Injectable } from '@nestjs/common';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';

@Injectable()
export class WorkflowCommonWorkspaceService {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  async getWorkflowVersionOrFail(workflowVersionId: string): Promise<
    Omit<WorkflowVersionWorkspaceEntity, 'trigger'> & {
      trigger: WorkflowTrigger;
    }
  > {
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
  ): Promise<
    Omit<WorkflowVersionWorkspaceEntity, 'trigger'> & {
      trigger: WorkflowTrigger;
    }
  > {
    if (!workflowVersion) {
      throw new WorkflowTriggerException(
        'Workflow version not found',
        WorkflowTriggerExceptionCode.INVALID_INPUT,
      );
    }

    if (!workflowVersion.trigger) {
      throw new WorkflowTriggerException(
        'Workflow version does not contains trigger',
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
      );
    }

    return { ...workflowVersion, trigger: workflowVersion.trigger };
  }
}
