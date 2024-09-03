import { Injectable } from '@nestjs/common';

import {
  CreateOneResolverArgs,
  DeleteOneResolverArgs,
  UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  WorkflowQueryHookException,
  WorkflowQueryHookExceptionCode,
} from 'src/modules/workflow/common/query-hooks/workflow-query-hook.exception';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/services/workflow-common.workspace-service';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowTrigger } from 'src/modules/workflow/common/types/workflow-trigger.type';

@Injectable()
export class WorkflowVersionValidationWorkspaceService {
  constructor(
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
  ) {}

  async validateWorkflowVersionForCreateOne(
    payload: CreateOneResolverArgs<WorkflowVersionWorkspaceEntity>,
  ) {
    if (
      payload.data.status &&
      payload.data.status !== WorkflowVersionStatus.DRAFT
    ) {
      throw new WorkflowQueryHookException(
        'Cannot create workflow version with status other than draft',
        WorkflowQueryHookExceptionCode.FORBIDDEN,
      );
    }
  }

  async validateWorkflowVersionForUpdateOne(
    payload: UpdateOneResolverArgs<WorkflowVersionWorkspaceEntity>,
  ) {
    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail(
        payload.id,
      );

    this.validateWorkflowVersionIsDraft(workflowVersion);

    if (payload.data.status !== workflowVersion.status) {
      throw new WorkflowQueryHookException(
        'Cannot update workflow version status manually',
        WorkflowQueryHookExceptionCode.FORBIDDEN,
      );
    }
  }

  async validateWorkflowVersionForDeleteOne(payload: DeleteOneResolverArgs) {
    const workflow =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail(
        payload.id,
      );

    this.validateWorkflowVersionIsDraft(workflow);
  }

  private validateWorkflowVersionIsDraft(
    workflowVersion: Omit<WorkflowVersionWorkspaceEntity, 'trigger'> & {
      trigger: WorkflowTrigger;
    },
  ) {
    if (workflowVersion.status !== WorkflowVersionStatus.DRAFT) {
      throw new WorkflowQueryHookException(
        'Workflow version is not in draft status',
        WorkflowQueryHookExceptionCode.FORBIDDEN,
      );
    }
  }
}
