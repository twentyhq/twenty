import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { IsNull, Not } from 'typeorm';

import {
  CreateOneResolverArgs,
  DeleteOneResolverArgs,
  UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
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
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async validateWorkflowVersionForCreateOne(
    workspaceId: string,
    payload: CreateOneResolverArgs<WorkflowVersionWorkspaceEntity>,
  ) {
    if (
      payload.data.status &&
      payload.data.status !== WorkflowVersionStatus.DRAFT
    ) {
      throw new WorkflowQueryValidationException(
        'Cannot create workflow version with status other than draft',
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: t`Cannot create workflow version with status other than draft`,
        },
      );
    }

    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true }, // settings permissions are checked at resolver-level
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
        {
          userFriendlyMessage: t`Cannot create multiple draft versions for the same workflow`,
        },
      );
    }
  }

  async validateWorkflowVersionForUpdateOne({
    workspaceId,
    payload,
  }: {
    workspaceId: string;
    payload: UpdateOneResolverArgs<WorkflowVersionWorkspaceEntity>;
  }) {
    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
        workspaceId,
        workflowVersionId: payload.id,
      });

    // If the only field updated is the name, we can update the workflow version
    // Otherwise, we need to assert that the workflow version is a draft
    if (!(Object.keys(payload.data).length === 1 && payload.data.name)) {
      assertWorkflowVersionIsDraft(workflowVersion);
    }

    if (payload.data.status && payload.data.status !== workflowVersion.status) {
      throw new WorkflowQueryValidationException(
        'Cannot update workflow version status manually',
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: t`Cannot update workflow version status manually`,
        },
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

  async validateWorkflowVersionForDeleteOne(
    workspaceId: string,
    payload: DeleteOneResolverArgs,
  ) {
    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
        workspaceId,
        workflowVersionId: payload.id,
      });

    assertWorkflowVersionIsDraft(workflowVersion);

    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true }, // settings permissions are checked at resolver-level
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
        {
          userFriendlyMessage: t`The initial version of a workflow can not be deleted`,
        },
      );
    }
  }
}
