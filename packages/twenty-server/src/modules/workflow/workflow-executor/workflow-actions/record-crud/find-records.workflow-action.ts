import { Injectable } from '@nestjs/common';

import {
  computeRecordGqlOperationFilter,
  getFilterTypeFromFieldType,
  isDefined,
  isRecordFilterValueValid,
  resolveInput,
} from 'twenty-shared/utils';
import { type FieldMetadataType } from 'twenty-shared/types';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
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

type FilterMonitoringRecord = {
  fieldMetadataId?: unknown;
  operand?: unknown;
};

const getFilterConversionMetricAttributes = ({
  recordFilters,
  fieldMetadataItems,
}: {
  recordFilters: unknown;
  fieldMetadataItems: { id: string; type: FieldMetadataType }[];
}) => {
  const fieldMetadataItemById = new Map(
    fieldMetadataItems.map((fieldMetadataItem) => [
      fieldMetadataItem.id,
      fieldMetadataItem,
    ]),
  );
  const filterTypes = new Set<string>();
  const operands = new Set<string>();

  if (Array.isArray(recordFilters)) {
    for (const recordFilter of recordFilters) {
      if (typeof recordFilter !== 'object' || recordFilter === null) {
        continue;
      }

      const { fieldMetadataId, operand } = recordFilter as FilterMonitoringRecord;

      if (typeof operand === 'string') {
        operands.add(operand);
      }

      if (typeof fieldMetadataId === 'string') {
        const fieldMetadataItem = fieldMetadataItemById.get(fieldMetadataId);

        if (isDefined(fieldMetadataItem)) {
          filterTypes.add(getFilterTypeFromFieldType(fieldMetadataItem.type));
        }
      }
    }
  }

  return {
    action_type: 'FIND_RECORDS',
    filter_type: [...filterTypes].sort().join(',') || 'UNKNOWN',
    operand: [...operands].sort().join(',') || 'UNKNOWN',
  };
};

@Injectable()
export class FindRecordsWorkflowAction implements WorkflowAction {
  constructor(
    private readonly findRecordsService: FindRecordsService,
    private readonly metricsService: MetricsService,
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

    const { flatFieldMetadataMaps } =
      await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
        workflowActionInput.objectName,
        workspaceId,
      );

    if (workflowActionInput.filter?.recordFilters) {
      for (const filter of workflowActionInput.filter.recordFilters) {
        if (!isRecordFilterValueValid(filter)) {
          throw new WorkflowStepExecutorException(
            `Filter condition has an empty value after variable resolution. This likely means a workflow variable could not be resolved. Filter field: ${filter.fieldMetadataId}, operand: ${filter.operand}`,
            WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
          );
        }
      }
    }

    const fieldMetadataItems = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined);

    let gqlOperationFilter = {};

    if (
      workflowActionInput.filter?.recordFilters &&
      workflowActionInput.filter?.recordFilterGroups
    ) {
      try {
        gqlOperationFilter = computeRecordGqlOperationFilter({
          fieldMetadataItems,
          recordFilters: workflowActionInput.filter.recordFilters,
          recordFilterGroups: workflowActionInput.filter.recordFilterGroups,
          filterValueDependencies: {
            timeZone: 'UTC',
          },
        });
      } catch (error) {
        void this.metricsService.incrementCounterForEvent({
          key: MetricsKeys.WorkflowFindRecordsFilterConversionFailed,
          eventId: runInfo.workflowRunId,
          attributes: getFilterConversionMetricAttributes({
            recordFilters: workflowActionInput.filter.recordFilters,
            fieldMetadataItems,
          }),
          shouldStoreInCache: false,
        });

        throw error;
      }
    }

    const toolOutput = await this.findRecordsService.execute({
      objectName: workflowActionInput.objectName,
      filter: gqlOperationFilter,
      orderBy: workflowActionInput.orderBy?.gqlOperationOrderBy,
      limit: workflowActionInput.limit,
      authContext: executionContext.authContext,
      rolePermissionConfig: executionContext.rolePermissionConfig,
    });

    if (!toolOutput.success) {
      return { error: toolOutput.error || toolOutput.message };
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
