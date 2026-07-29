import { isWorkflowFindRecordsAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/guards/is-workflow-find-records-action.guard';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

type WorkflowStepMonitoringContextInput = {
  step: WorkflowAction;
  workflowId: string;
  workflowRunId: string;
};

type FilterMonitoringContext = {
  fieldMetadataId?: unknown;
  operand?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getRecordFiltersMonitoringContext = (
  recordFilters: unknown,
): {
  filterCount: number;
  filters: FilterMonitoringContext[];
} => {
  if (!Array.isArray(recordFilters)) {
    return { filterCount: 0, filters: [] };
  }

  return {
    filterCount: recordFilters.length,
    filters: recordFilters.flatMap((recordFilter) => {
      if (!isRecord(recordFilter)) {
        return [];
      }

      return [
        {
          fieldMetadataId: recordFilter.fieldMetadataId,
          operand: recordFilter.operand,
        },
      ];
    }),
  };
};

export const getWorkflowStepMonitoringContext = ({
  step,
  workflowId,
  workflowRunId,
}: WorkflowStepMonitoringContextInput): Record<string, unknown> => {
  const context: Record<string, unknown> = {
    workflowId,
    workflowRunId,
    stepId: step.id,
    stepType: step.type,
  };

  if (!isWorkflowFindRecordsAction(step)) {
    return context;
  }

  const { objectName, filter } = step.settings.input;
  const filterContext = getRecordFiltersMonitoringContext(
    filter?.recordFilters,
  );

  return {
    ...context,
    objectName,
    filterGroupCount: Array.isArray(filter?.recordFilterGroups)
      ? filter.recordFilterGroups.length
      : 0,
    ...filterContext,
  };
};
