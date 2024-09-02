import { Injectable } from '@nestjs/common';

import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  WorkflowVersionValidationException,
  WorkflowVersionValidationExceptionCode,
} from 'src/modules/workflow/common/query-hooks/workflow-version/workflow-version-validation.exception';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workflow-common.workspace-service';

@Injectable()
export class WorkflowVersionValidationWorkspaceService {
  constructor(
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
  ) {}

  async validateWorkflowVersionForUpdateOne(
    payload: UpdateOneResolverArgs<WorkflowVersionWorkspaceEntity>,
  ) {
    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail(
        payload.id,
      );

    if (workflowVersion.status !== WorkflowVersionStatus.DRAFT) {
      throw new WorkflowVersionValidationException(
        'Only draft workflow versions can be updated',
        WorkflowVersionValidationExceptionCode.FORBIDDEN,
      );
    }

    if (payload.data.status !== workflowVersion.status) {
      throw new WorkflowVersionValidationException(
        'Cannot update workflow version status manually',
        WorkflowVersionValidationExceptionCode.FORBIDDEN,
      );
    }
  }
}
