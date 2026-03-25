import { Injectable } from '@nestjs/common';

import { isDefined, isValidUuid, resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { buildWorkflowActorMetadata } from 'src/modules/workflow/workflow-executor/utils/build-workflow-actor-metadata.util';
import { filterValidFieldsInRecord } from 'src/modules/workflow/workflow-executor/utils/filter-valid-fields-in-record.util';
import { formatWorkflowRecordRelationFields } from 'src/modules/workflow/workflow-executor/utils/format-workflow-record-relation-fields.util';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { resolveRichTextFieldsInRecord } from 'src/modules/workflow/workflow-executor/utils/resolve-rich-text-fields-in-record.util';
import { isWorkflowUpdateRecordAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/guards/is-workflow-update-record-action.guard';
import { type WorkflowUpdateRecordActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';

@Injectable()
export class UpdateRecordWorkflowAction implements WorkflowAction {
  constructor(
    private readonly updateRecordService: UpdateRecordService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({
      steps,
      stepId: currentStepId,
    });

    if (!isWorkflowUpdateRecordAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not an update record action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const { workspaceId } = runInfo;

    const rawInput = step.settings.input as WorkflowUpdateRecordActionInput;

    const objectMetadataInfo =
      await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
        rawInput.objectName,
        workspaceId,
      );

    const inputWithResolvedRichText = {
      ...rawInput,
      objectRecord: resolveRichTextFieldsInRecord(
        rawInput.objectRecord,
        objectMetadataInfo,
        context,
      ),
    };

    const workflowActionInput = resolveInput(
      inputWithResolvedRichText,
      context,
    ) as WorkflowUpdateRecordActionInput;

    if (
      !isDefined(workflowActionInput.objectRecordId) ||
      !isValidUuid(workflowActionInput.objectRecordId) ||
      !isDefined(workflowActionInput.objectName)
    ) {
      throw new WorkflowStepExecutorException(
        'Failed to update: Object record ID and name are required',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    const formattedObjectRecord = formatWorkflowRecordRelationFields(
      workflowActionInput.objectRecord,
      objectMetadataInfo,
    );

    const filteredObjectRecord = filterValidFieldsInRecord(
      formattedObjectRecord,
      objectMetadataInfo.flatObjectMetadata,
      objectMetadataInfo.flatFieldMetadataMaps,
    );

    const filteredFieldsToUpdate = workflowActionInput.fieldsToUpdate?.filter(
      (fieldName) => fieldName in filteredObjectRecord,
    );

    if (filteredFieldsToUpdate?.length === 0) {
      throw new WorkflowStepExecutorException(
        'Failed to update: No fields to update',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    const executionContext =
      await this.workflowExecutionContextService.getExecutionContext(runInfo);

    const updatedBy = buildWorkflowActorMetadata(executionContext);

    const toolOutput = await this.updateRecordService.execute({
      objectName: workflowActionInput.objectName,
      objectRecordId: workflowActionInput.objectRecordId,
      objectRecord: filteredObjectRecord,
      fieldsToUpdate: filteredFieldsToUpdate,
      authContext: executionContext.authContext,
      updatedBy,
      rolePermissionConfig: executionContext.rolePermissionConfig,
    });

    if (!toolOutput.success) {
      return { error: toolOutput.error || toolOutput.message };
    }

    return {
      result: toolOutput.result,
    };
  }
}
