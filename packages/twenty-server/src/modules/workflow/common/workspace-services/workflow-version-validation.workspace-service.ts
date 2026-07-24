import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { IsNull, Not } from 'typeorm';

import {
  type CreateOneResolverArgs,
  type DeleteOneResolverArgs,
  type UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { assertWorkflowVersionIsDraft } from 'src/modules/workflow/common/utils/assert-workflow-version-is-draft.util';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

@Injectable()
export class WorkflowVersionValidationWorkspaceService {
  constructor(
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
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
          userFriendlyMessage: msg`Cannot create workflow version with status other than draft`,
        },
      );
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowVersionRepository =
        await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
          workspaceId,
          'workflowVersion',
          { shouldBypassPermissionChecks: true },
        );

      const workflowAlreadyHasDraftVersion =
        await workflowVersionRepository.exists({
          where: {
            workflowId: payload.data.workflowId,
            status: WorkflowVersionStatus.DRAFT,
            deletedAt: IsNull(),
          },
        });

      if (workflowAlreadyHasDraftVersion) {
        throw new WorkflowQueryValidationException(
          'Cannot create multiple draft versions for the same workflow',
          WorkflowQueryValidationExceptionCode.FORBIDDEN,
          {
            userFriendlyMessage: msg`Cannot create multiple draft versions for the same workflow`,
          },
        );
      }
    }, authContext);
  }

  async validateWorkflowVersionForUpdateOne({
    workspaceId,
    payload,
  }: {
    workspaceId: string;
    payload: UpdateOneResolverArgs<WorkflowVersionWorkspaceEntity>;
  }) {
    await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
      workspaceId,
      workflowVersionId: payload.id,
    });

    const protectedFieldNames = [
      'steps',
      'trigger',
      'status',
      'position',
      'workflowId',
      'coreWorkflowVersionId',
    ];
    const setsProtectedField = protectedFieldNames.some(
      (fieldName) => fieldName in payload.data,
    );
    const clearsName =
      'name' in payload.data && !isNonEmptyString(payload.data.name);

    if (setsProtectedField || clearsName) {
      throw new WorkflowQueryValidationException(
        'Updating a workflowVersion through the generic mutation is restricted. ' +
          'steps, trigger, status, position, workflowId and coreWorkflowVersionId cannot be changed, and the name cannot be cleared. ' +
          'Use the dedicated workflowVersion mutations (createWorkflowVersionStep, updateWorkflowVersionStep, ' +
          'deleteWorkflowVersionStep, updateWorkflowVersionTrigger, activateWorkflowVersion, ...) instead.',
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`This field cannot be updated directly on a workflow version`,
        },
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

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowVersionRepository =
        await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
          workspaceId,
          'workflowVersion',
          { shouldBypassPermissionChecks: true },
        );

      const otherWorkflowVersionsExist = await workflowVersionRepository.exists(
        {
          where: {
            workflowId: workflowVersion.workflowId,
            deletedAt: IsNull(),
            id: Not(workflowVersion.id),
          },
        },
      );

      if (!otherWorkflowVersionsExist) {
        throw new WorkflowQueryValidationException(
          'The initial version of a workflow can not be deleted',
          WorkflowQueryValidationExceptionCode.FORBIDDEN,
          {
            userFriendlyMessage: msg`The initial version of a workflow can not be deleted`,
          },
        );
      }
    }, authContext);
  }
}
