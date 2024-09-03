import { Injectable } from '@nestjs/common';

import {
  CreateOneResolverArgs,
  DeleteOneResolverArgs,
  UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/query-hooks/workflow-query-validation.exception';
import { assertWorkflowVersionIsDraft } from 'src/modules/workflow/common/query-hooks/workflow-version/utils/assert-workflow-version-is-draft.util';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/services/workflow-common.workspace-service';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

@Injectable()
export class WorkflowVersionValidationWorkspaceService {
  constructor(
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  async validateWorkflowVersionForCreateOne(
    payload: CreateOneResolverArgs<WorkflowVersionWorkspaceEntity>,
  ) {
    if (
      payload.data.status &&
      payload.data.status !== WorkflowVersionStatus.DRAFT
    ) {
      throw new WorkflowQueryValidationException(
        'Cannot create workflow version with status other than draft',
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
      );
    }

    const workflowVersionRepository =
      await this.twentyORMManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
      );

    const workflowAlreadyHasDraftVersion =
      await workflowVersionRepository.exists({
        where: {
          workflowId: payload.data.workflowId,
          status: WorkflowVersionStatus.DRAFT,
        },
      });

    if (workflowAlreadyHasDraftVersion) {
      throw new WorkflowQueryValidationException(
        'Cannot create multiple draft versions for the same workflow',
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
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

    assertWorkflowVersionIsDraft(workflowVersion);

    if (payload.data.status !== workflowVersion.status) {
      throw new WorkflowQueryValidationException(
        'Cannot update workflow version status manually',
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
      );
    }
  }

  async validateWorkflowVersionForDeleteOne(payload: DeleteOneResolverArgs) {
    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail(
        payload.id,
      );

    assertWorkflowVersionIsDraft(workflowVersion);
  }
}
