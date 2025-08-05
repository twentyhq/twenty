import { Injectable } from '@nestjs/common';

import deepEqual from 'deep-equal';
import { isDefined, isValidUuid, resolveInput } from 'twenty-shared/utils';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import {
  RecordCRUDActionException,
  RecordCRUDActionExceptionCode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/exceptions/record-crud-action.exception';
import { isWorkflowUpdateRecordAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/guards/is-workflow-update-record-action.guard';
import { WorkflowUpdateRecordActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';

@Injectable()
export class UpdateRecordWorkflowAction implements WorkflowAction {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly recordInputTransformerService: RecordInputTransformerService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = steps.find((step) => step.id === currentStepId);

    if (!step) {
      throw new WorkflowStepExecutorException(
        'Step not found',
        WorkflowStepExecutorExceptionCode.STEP_NOT_FOUND,
      );
    }

    if (!isWorkflowUpdateRecordAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not an update record action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const workflowActionInput = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowUpdateRecordActionInput;

    if (
      !isDefined(workflowActionInput.objectRecordId) ||
      !isValidUuid(workflowActionInput.objectRecordId) ||
      !isDefined(workflowActionInput.objectName)
    ) {
      throw new RecordCRUDActionException(
        'Failed to update: Object record ID and name are required',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      throw new RecordCRUDActionException(
        'Failed to update: Workspace ID is required',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        workflowActionInput.objectName,
        { shouldBypassPermissionChecks: true },
      );

    const previousObjectRecord = await repository.findOne({
      where: {
        id: workflowActionInput.objectRecordId,
      },
    });

    if (!previousObjectRecord) {
      throw new RecordCRUDActionException(
        `Failed to update: Record ${workflowActionInput.objectName} with id ${workflowActionInput.objectRecordId} not found`,
        RecordCRUDActionExceptionCode.RECORD_NOT_FOUND,
      );
    }

    if (workflowActionInput.fieldsToUpdate.length === 0) {
      return {
        result: previousObjectRecord,
      };
    }

    const { objectMetadataItemWithFieldsMaps } =
      await this.workflowCommonWorkspaceService.getObjectMetadataItemWithFieldsMaps(
        workflowActionInput.objectName,
        workspaceId,
      );

    const objectRecordWithFilteredFields = Object.keys(
      workflowActionInput.objectRecord,
    ).reduce((acc, key) => {
      if (workflowActionInput.fieldsToUpdate.includes(key)) {
        return {
          ...acc,
          [key]: workflowActionInput.objectRecord[key],
        };
      }

      return acc;
    }, {});

    const transformedObjectRecord =
      await this.recordInputTransformerService.process({
        recordInput: objectRecordWithFilteredFields,
        objectMetadataMapItem: objectMetadataItemWithFieldsMaps,
      });

    const updatedObjectRecord = {
      ...previousObjectRecord,
      ...objectRecordWithFilteredFields,
    };

    if (!deepEqual(updatedObjectRecord, previousObjectRecord)) {
      await repository.update(workflowActionInput.objectRecordId, {
        ...transformedObjectRecord,
      });
    }

    return {
      result: updatedObjectRecord,
    };
  }
}
