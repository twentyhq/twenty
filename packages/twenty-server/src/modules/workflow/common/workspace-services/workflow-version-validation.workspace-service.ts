import { Injectable } from '@nestjs/common';

import { IsNull, Not } from 'typeorm';

import {
  CreateOneResolverArgs,
  DeleteOneResolverArgs,
  UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { assertWorkflowVersionIsDraft } from 'src/modules/workflow/common/utils/assert-workflow-version-is-draft.util';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

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
          // FIXME: soft-deleted rows selection will have to be improved globally
          deletedAt: IsNull(),
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

    if (payload.data.status && payload.data.status !== workflowVersion.status) {
      throw new WorkflowQueryValidationException(
        'Cannot update workflow version status manually',
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
      );
    }

    if (payload.data.steps) {
      throw new WorkflowQueryValidationException(
        'Updating workflowVersion steps directly is forbidden. ' +
          'Use createWorkflowVersionStep, updateWorkflowVersionStep or deleteWorkflowVersionStep endpoint instead.',
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

    const workflowVersionRepository =
      await this.twentyORMManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
      );

    const otherWorkflowVersionsExist = await workflowVersionRepository.exists({
      where: {
        workflowId: workflowVersion.workflowId,
        deletedAt: IsNull(),
        id: Not(workflowVersion.id),
      },
    });

    if (!otherWorkflowVersionsExist) {
      throw new WorkflowQueryValidationException(
        'The initial version of a workflow can not be deleted',
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
      );
    }
  }
}
