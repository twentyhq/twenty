import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardWorkflowVersionViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'workflowVersion'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allWorkflowVersionsName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowVersion',
      context: {
        viewName: 'allWorkflowVersions',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    allWorkflowVersionsWorkflow: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowVersion',
      context: {
        viewName: 'allWorkflowVersions',
        viewFieldName: 'workflow',
        fieldName: 'workflow',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allWorkflowVersionsStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowVersion',
      context: {
        viewName: 'allWorkflowVersions',
        viewFieldName: 'status',
        fieldName: 'status',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allWorkflowVersionsUpdatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowVersion',
      context: {
        viewName: 'allWorkflowVersions',
        viewFieldName: 'updatedAt',
        fieldName: 'updatedAt',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    allWorkflowVersionsRuns: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowVersion',
      context: {
        viewName: 'allWorkflowVersions',
        viewFieldName: 'runs',
        fieldName: 'runs',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),

    // workflowVersionRecordPageFields view fields
    workflowVersionRecordPageFieldsStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowVersion',
      context: {
        viewName: 'workflowVersionRecordPageFields',
        viewFieldName: 'status',
        fieldName: 'status',
        position: 1,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    workflowVersionRecordPageFieldsWorkflow:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'workflowVersion',
        context: {
          viewName: 'workflowVersionRecordPageFields',
          viewFieldName: 'workflow',
          fieldName: 'workflow',
          position: 2,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    workflowVersionRecordPageFieldsTrigger: createStandardViewFieldFlatMetadata(
      {
        ...args,
        objectName: 'workflowVersion',
        context: {
          viewName: 'workflowVersionRecordPageFields',
          viewFieldName: 'trigger',
          fieldName: 'trigger',
          position: 3,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      },
    ),
    workflowVersionRecordPageFieldsCreatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'workflowVersion',
        context: {
          viewName: 'workflowVersionRecordPageFields',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'system',
        },
      }),
    workflowVersionRecordPageFieldsSteps: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowVersion',
      context: {
        viewName: 'workflowVersionRecordPageFields',
        viewFieldName: 'steps',
        fieldName: 'steps',
        position: 7,
        isVisible: false,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    workflowVersionRecordPageFieldsCreatedBy:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'workflowVersion',
        context: {
          viewName: 'workflowVersionRecordPageFields',
          viewFieldName: 'createdBy',
          fieldName: 'createdBy',
          position: 1,
          isVisible: false,
          size: 150,
          viewFieldGroupName: 'system',
        },
      }),
    workflowVersionRecordPageFieldsUpdatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'workflowVersion',
        context: {
          viewName: 'workflowVersionRecordPageFields',
          viewFieldName: 'updatedAt',
          fieldName: 'updatedAt',
          position: 2,
          isVisible: false,
          size: 150,
          viewFieldGroupName: 'system',
        },
      }),
    workflowVersionRecordPageFieldsUpdatedBy:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'workflowVersion',
        context: {
          viewName: 'workflowVersionRecordPageFields',
          viewFieldName: 'updatedBy',
          fieldName: 'updatedBy',
          position: 3,
          isVisible: false,
          size: 150,
          viewFieldGroupName: 'system',
        },
      }),
    workflowVersionRecordPageFieldsRuns: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowVersion',
      context: {
        viewName: 'workflowVersionRecordPageFields',
        viewFieldName: 'runs',
        fieldName: 'runs',
        position: 4,
        isVisible: false,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    workflowVersionRecordPageFieldsTimelineActivities:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'workflowVersion',
        context: {
          viewName: 'workflowVersionRecordPageFields',
          viewFieldName: 'timelineActivities',
          fieldName: 'timelineActivities',
          position: 6,
          isVisible: false,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
  };
};
