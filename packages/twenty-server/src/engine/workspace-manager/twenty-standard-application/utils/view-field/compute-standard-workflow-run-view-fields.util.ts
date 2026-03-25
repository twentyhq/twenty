import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardWorkflowRunViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'workflowRun'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allWorkflowRunsName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowRun',
      context: {
        viewName: 'allWorkflowRuns',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    allWorkflowRunsWorkflow: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowRun',
      context: {
        viewName: 'allWorkflowRuns',
        viewFieldName: 'workflow',
        fieldName: 'workflow',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allWorkflowRunsStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowRun',
      context: {
        viewName: 'allWorkflowRuns',
        viewFieldName: 'status',
        fieldName: 'status',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),

    // workflowRunRecordPageFields view fields
    workflowRunRecordPageFieldsName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowRun',
      context: {
        viewName: 'workflowRunRecordPageFields',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    workflowRunRecordPageFieldsStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowRun',
      context: {
        viewName: 'workflowRunRecordPageFields',
        viewFieldName: 'status',
        fieldName: 'status',
        position: 1,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    workflowRunRecordPageFieldsWorkflow: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowRun',
      context: {
        viewName: 'workflowRunRecordPageFields',
        viewFieldName: 'workflow',
        fieldName: 'workflow',
        position: 2,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    workflowRunRecordPageFieldsWorkflowVersion:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'workflowRun',
        context: {
          viewName: 'workflowRunRecordPageFields',
          viewFieldName: 'workflowVersion',
          fieldName: 'workflowVersion',
          position: 3,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    workflowRunRecordPageFieldsStartedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowRun',
      context: {
        viewName: 'workflowRunRecordPageFields',
        viewFieldName: 'startedAt',
        fieldName: 'startedAt',
        position: 4,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    workflowRunRecordPageFieldsEndedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowRun',
      context: {
        viewName: 'workflowRunRecordPageFields',
        viewFieldName: 'endedAt',
        fieldName: 'endedAt',
        position: 5,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    workflowRunRecordPageFieldsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowRun',
      context: {
        viewName: 'workflowRunRecordPageFields',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 0,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'other',
      },
    }),
    workflowRunRecordPageFieldsCreatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowRun',
      context: {
        viewName: 'workflowRunRecordPageFields',
        viewFieldName: 'createdBy',
        fieldName: 'createdBy',
        position: 1,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'other',
      },
    }),
  };
};
