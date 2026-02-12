import { Injectable } from '@nestjs/common';

import { isDefined, resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { UpsertRecordService } from 'src/engine/core-modules/record-crud/services/upsert-record.service';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { filterValidFieldsInRecord } from 'src/modules/workflow/workflow-executor/utils/filter-valid-fields-in-record.util';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { resolveRichTextFieldsInRecord } from 'src/modules/workflow/workflow-executor/utils/resolve-rich-text-fields-in-record.util';
import { isWorkflowUpsertRecordAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/guards/is-workflow-upsert-record-action.guard';
import { type WorkflowUpsertRecordActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';

@Injectable()
export class UpsertRecordWorkflowAction implements WorkflowAction {
  constructor(
    private readonly upsertRecordService: UpsertRecordService,
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

    if (!isWorkflowUpsertRecordAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not an upsert record action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const { workspaceId } = runInfo;

    const rawInput = step.settings.input as WorkflowUpsertRecordActionInput;

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
    ) as WorkflowUpsertRecordActionInput;

    if (!isDefined(workflowActionInput.objectName)) {
      throw new RecordCrudException(
        'Failed to upsert: Object name is required',
        RecordCrudExceptionCode.INVALID_REQUEST,
      );
    }

    const filteredObjectRecord = filterValidFieldsInRecord(
      workflowActionInput.objectRecord,
      objectMetadataInfo.flatObjectMetadata,
      objectMetadataInfo.flatFieldMetadataMaps,
    );

    const executionContext =
      await this.workflowExecutionContextService.getExecutionContext(runInfo);

    const toolOutput = await this.upsertRecordService.execute({
      objectName: workflowActionInput.objectName,
      objectRecord: filteredObjectRecord,
      authContext: executionContext.authContext,
      rolePermissionConfig: executionContext.rolePermissionConfig,
    });

    if (!toolOutput.success) {
      throw new RecordCrudException(
        toolOutput.error || toolOutput.message,
        RecordCrudExceptionCode.RECORD_UPSERT_FAILED,
      );
    }

    return {
      result: toolOutput.result,
    };
  }
}
