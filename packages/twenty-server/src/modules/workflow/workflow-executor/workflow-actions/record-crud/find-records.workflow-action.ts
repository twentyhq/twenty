import { Injectable } from '@nestjs/common';

import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
} from 'twenty-shared/types';
import {
  computeRecordGqlOperationFilter,
  isDefined,
  resolveInput,
} from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowFindRecordsAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/guards/is-workflow-find-records-action.guard';
import { type WorkflowFindRecordsActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';

@Injectable()
export class FindRecordsWorkflowAction implements WorkflowAction {
  constructor(
    private readonly findRecordsService: FindRecordsService,
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

    if (!isWorkflowFindRecordsAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a find records action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const workflowActionInput = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowFindRecordsActionInput;

    const { workspaceId } = runInfo;

    const executionContext =
      await this.workflowExecutionContextService.getExecutionContext(runInfo);

    const { flatObjectMetadata, flatFieldMetadataMaps } =
      await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
        workflowActionInput.objectName,
        workspaceId,
      );

    const fields = flatObjectMetadata.fieldMetadataIds
      .map((fieldId) => {
        const field = flatFieldMetadataMaps.byId[fieldId];

        if (!field) {
          return null;
        }

        return {
          id: field.id,
          name: field.name,
          type: field.type,
          label: field.label,
          // Note: force cast is required until we deprecate the CreateFieldInput and UpdateFieldInput
          // type derivation from the FieldMetadataDto
          options: field.options as
            | (FieldMetadataDefaultOption & { id: string })[]
            | (FieldMetadataComplexOption & { id: string })[]
            | null,
        };
      })
      .filter(isDefined);

    const gqlOperationFilter =
      workflowActionInput.filter?.recordFilters &&
      workflowActionInput.filter?.recordFilterGroups
        ? computeRecordGqlOperationFilter({
            fields,
            recordFilters: workflowActionInput.filter.recordFilters,
            recordFilterGroups: workflowActionInput.filter.recordFilterGroups,
            filterValueDependencies: {
              timeZone: 'UTC',
            },
          })
        : {};

    const toolOutput = await this.findRecordsService.execute({
      objectName: workflowActionInput.objectName,
      filter: gqlOperationFilter,
      orderBy: workflowActionInput.orderBy?.gqlOperationOrderBy,
      limit: workflowActionInput.limit,
      authContext: executionContext.authContext,
      rolePermissionConfig: executionContext.rolePermissionConfig,
    });

    if (!toolOutput.success) {
      throw new RecordCrudException(
        toolOutput.error || toolOutput.message,
        RecordCrudExceptionCode.QUERY_FAILED,
      );
    }

    const records = toolOutput.result?.records ?? [];
    const totalCount = toolOutput.result?.count ?? 0;

    return {
      result: {
        first: records[0],
        all: records,
        totalCount,
      },
    };
  }
}
